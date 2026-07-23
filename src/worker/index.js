// Fronts the static site: only /api/* is routed here (see wrangler.jsonc
// assets.run_worker_first), everything else falls through to ASSETS
// untouched. An hourly cron refreshes a small cache of Ronald's real public
// GitHub commits for the homepage ticker; /api/ticker serves that cache,
// falling back to a live fetch (and re-seeding the cache) on a cold miss.

const GITHUB_USER = 'ronaldlokers';
const KV_KEY = 'commits';
const TICKER_LIMIT = 8;

// Optional GITHUB_TOKEN secret (wrangler secret put GITHUB_TOKEN) raises the
// rate limit from 60/hr unauthenticated to 5000/hr — no scopes needed, every
// call here reads public data. Works fine unset, just tighter on quota.
function ghHeaders(env) {
  const headers = { 'User-Agent': 'lokilabs.nl-ticker', Accept: 'application/vnd.github+json' };
  if (env && env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  return headers;
}

async function getDefaultBranch(repo, cache, env) {
  if (cache.has(repo)) return cache.get(repo);
  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: ghHeaders(env) });
  const branch = res.ok ? (await res.json()).default_branch : 'main';
  cache.set(repo, branch);
  return branch;
}

async function fetchRecentCommits(env) {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/events/public`, { headers: ghHeaders(env) });
  if (!res.ok) throw new Error(`github events ${res.status}`);
  const events = await res.json();

  // The public events API no longer inlines payload.commits (GitHub dropped
  // it), only payload.head — the sha of the push's newest commit. Look each
  // one up individually to get its message.
  const pushes = events.filter((e) => e.type === 'PushEvent' && e.payload && e.payload.head && e.repo);
  const defaultBranches = new Map();
  const commits = [];
  for (const event of pushes) {
    if (commits.length >= TICKER_LIMIT) break;
    const repo = event.repo.name;
    const sha = event.payload.head;
    try {
      // Only show commits that landed on the repo's default branch — skip
      // feature-branch pushes.
      const branch = await getDefaultBranch(repo, defaultBranches, env);
      if (event.payload.ref !== `refs/heads/${branch}`) continue;
      const cRes = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}`, { headers: ghHeaders(env) });
      if (!cRes.ok) continue;
      const commit = await cRes.json();
      const message = commit.commit && commit.commit.message;
      if (!message) continue;
      commits.push({
        sha: sha.slice(0, 7),
        message: message.split('\n')[0].slice(0, 72),
        repo: repo.split('/').pop(),
        date: event.created_at,
      });
    } catch {
      // skip this one, keep going
    }
  }
  return commits;
}

async function handleTicker(env, ctx) {
  const cached = await env.TICKER_KV.get(KV_KEY, 'json');
  if (cached) {
    return Response.json(cached, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  }

  // Cold cache (first deploy, before the first cron run) — fetch live once
  // and seed it so subsequent requests hit KV.
  try {
    const commits = await fetchRecentCommits(env);
    ctx.waitUntil(env.TICKER_KV.put(KV_KEY, JSON.stringify(commits), { expirationTtl: 3600 }));
    return Response.json(commits, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (err) {
    return Response.json([], { headers: { 'Cache-Control': 'public, max-age=60' } });
  }
}

// First-party, cookie-free click counter — the site's only "analytics"
// beyond Cloudflare Web Analytics' own pageviews. Allowlisted event keys
// only, so a client can't create arbitrary KV entries. Reads plain, no
// auth: it's just aggregate counts, low stakes for a personal site, and
// this keeps it a one-visit check rather than a login flow to build.
const TRACK_KEYS = ['cv', 'mailto', 'github', 'linkedin'];

async function handleTrack(request, env, ctx) {
  if (request.method === 'POST') {
    const key = (await request.text()).trim();
    if (!TRACK_KEYS.includes(key)) return new Response('bad key', { status: 400 });
    ctx.waitUntil(bumpCounter(env, key));
    return new Response(null, { status: 204 });
  }
  if (request.method === 'GET') {
    const counts = {};
    for (const key of TRACK_KEYS) counts[key] = Number((await env.TICKER_KV.get(`track:${key}`)) || 0);
    return Response.json(counts, { headers: { 'Cache-Control': 'no-store' } });
  }
  return new Response('method not allowed', { status: 405 });
}

async function bumpCounter(env, key) {
  const kvKey = `track:${key}`;
  // Read-modify-write, not atomic — KV has no increment op. A lost update
  // under truly concurrent hits is possible; at this site's traffic that's
  // a rounding error, not a correctness bug worth a Durable Object for.
  const current = Number((await env.TICKER_KV.get(kvKey)) || 0);
  await env.TICKER_KV.put(kvKey, String(current + 1));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/ticker') return handleTicker(env, ctx);
    if (url.pathname === '/api/track') return handleTrack(request, env, ctx);
    if (url.pathname.startsWith('/api/')) return new Response('not found', { status: 404 });
    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      fetchRecentCommits(env)
        .then((commits) => env.TICKER_KV.put(KV_KEY, JSON.stringify(commits), { expirationTtl: 3600 }))
        .catch((err) => console.error('ticker refresh failed', err))
    );
  },
};
