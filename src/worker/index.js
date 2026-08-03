// Fronts the static site: only /api/* is routed here (see wrangler.jsonc
// assets.run_worker_first), everything else falls through to ASSETS
// untouched. An hourly cron refreshes a small cache of Ronald's real public
// GitHub commits for the homepage ticker; /api/ticker serves that cache,
// falling back to a live fetch (and re-seeding the cache) on a cold miss.

const GITHUB_USER = 'ronaldlokers';
const KV_KEY = 'commits';
const TICKER_LIMIT = 8;
// The cron runs hourly; caching for exactly that long means a single missed
// or delayed run fully expires the cache, and every concurrent visitor in
// that window independently cold-fetches (a ~17-call chain against GitHub's
// API each). Cache for 2 cron intervals plus buffer instead — a lone missed
// run just serves slightly stale data until the next one succeeds, rather
// than triggering a thundering herd.
const TICKER_TTL = 7500;
// Timestamp of the cron's last successful run, read by /api/healthz —
// separate from KV_KEY's own TTL so a stale/expired cache still reports a
// precise "how long has it actually been" instead of just vanishing.
const TICKER_LAST_SUCCESS_KEY = 'ticker:lastSuccessAt';
// One missed hourly run tolerated before /api/healthz reports unhealthy —
// matches TICKER_TTL's own tolerance.
const HEALTHZ_MAX_AGE_MS = TICKER_TTL * 1000;

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
  if (!res.ok) console.error(`getDefaultBranch(${repo}) failed (${res.status}), assuming 'main' — a repo whose real default differs will silently drop from the ticker`);
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
    ctx.waitUntil(env.TICKER_KV.put(KV_KEY, JSON.stringify(commits), { expirationTtl: TICKER_TTL }));
    return Response.json(commits, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (err) {
    console.error('ticker cold-fetch failed', err);
    return Response.json([], { headers: { 'Cache-Control': 'public, max-age=60' } });
  }
}

// First-party, cookie-free click counter — the site's only "analytics"
// beyond Cloudflare Web Analytics' own pageviews. Allowlisted event keys
// only, so a client can't create arbitrary KV entries. Reads plain, no
// auth: it's just aggregate counts, low stakes for a personal site, and
// this keeps it a one-visit check rather than a login flow to build.
const TRACK_KEYS = ['cv', 'mailto', 'github', 'linkedin'];

// Best-effort per-IP throttle. This used to be KV-backed, which cost a write
// per counted click on top of bumpCounter's own — so on the Free plan's
// 1,000 writes/day (account-wide, shared with the cron's 48) half the budget
// went to protecting the other half, capping the site at ~476 tracked clicks
// a day. It bought little: a blocked request already skipped its write, so a
// distributed flood was never bounded by it anyway, only a single noisy IP.
// The in-isolate limiter below costs nothing and blunts the same casual
// script, which doubles real capacity to ~950 clicks/day.
const TRACK_RATE_LIMIT = 20;
const TRACK_RATE_WINDOW_MS = 60_000;

// In-isolate throttle: a plain Map in module scope, no KV, therefore no writes.
// Used by /api/csp-report, which is unauthenticated and must never consume the
// KV write budget — on the Free plan that budget is 1,000 writes/day for the
// whole account, and it is shared with the conversion counters, so letting an
// anonymous endpoint spend it would hand anyone a way to silently stop the
// site's only success metric from moving.
//
// Per-isolate rather than global, so it is a blunt instrument: Cloudflare runs
// many isolates and a distributed flood spreads across them. That is an
// acceptable trade for an endpoint whose only job is writing lines to a log —
// the body/array caps bound the damage per request, and this bounds the rate
// per isolate. Anything stronger wants a Durable Object, which is not worth it
// here.
// Keyed by scope+ip, not ip alone: /api/track and /api/csp-report have
// unrelated budgets, and sharing one bucket would let a visitor's own link
// clicks consume the allowance for their browser's violation reports (and
// vice versa).
const ISOLATE_RATE = new Map();
function isIsolateRateLimited(scope, ip, limit, windowMs, now) {
  const key = `${scope}:${ip}`;
  const entry = ISOLATE_RATE.get(key);
  if (!entry || now - entry.start > windowMs) {
    // Opportunistic sweep: the Map is per-isolate and short-lived, but a long-
    // running isolate under many distinct IPs would otherwise grow unbounded.
    if (ISOLATE_RATE.size > 5000) ISOLATE_RATE.clear();
    ISOLATE_RATE.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

const CSP_RATE_LIMIT = 20;
const CSP_RATE_WINDOW_MS = 60_000;

// Longest allowlisted key is 8 chars; anything beyond this is not a real
// beacon, so reject on Content-Length before reading the body at all —
// previously a 20MB bogus payload was read in full, and because the key was
// validated BEFORE the rate limiter ran, invalid-key floods skipped it
// entirely.
const TRACK_MAX_BODY = 32;

async function handleTrack(request, env, ctx) {
  if (request.method === 'POST') {
    const declared = Number(request.headers.get('Content-Length') || 0);
    if (declared > TRACK_MAX_BODY) return new Response('too large', { status: 413 });
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isIsolateRateLimited('track', ip, TRACK_RATE_LIMIT, TRACK_RATE_WINDOW_MS, Date.now())) {
      return new Response('rate limited', { status: 429 });
    }
    const key = (await request.text()).slice(0, TRACK_MAX_BODY).trim();
    if (!TRACK_KEYS.includes(key)) return new Response('bad key', { status: 400 });
    // .catch so a failed counter write is logged rather than becoming a silent
    // unhandled rejection behind the 204 the client already received — this is
    // the site's only success metric, so losing writes quietly is the worst
    // possible failure mode.
    ctx.waitUntil(bumpCounter(env, key).catch((err) => console.error('bumpCounter failed', key, err)));
    return new Response(null, { status: 204 });
  }
  if (request.method === 'GET') {
    const counts = {};
    for (const key of TRACK_KEYS) counts[key] = Number((await env.TICKER_KV.get(`track:${key}`)) || 0);
    return Response.json(counts, { headers: { 'Cache-Control': 'no-store' } });
  }
  return new Response('method not allowed', { status: 405 });
}

// CSP violation reports (public/_headers' report-to / report-uri point
// here) — the print-button regression this session shipped was invisible
// to every check until a human clicked it; logging violations means the
// next one at least shows up in Workers Logs instead of needing that.
// Real browser report batches are small. Without these caps the endpoint took
// any method from anyone at any rate: a 14MB body holding 60k report objects
// drove 60k sequential console.error calls and pinned the worker, which also
// defeats the endpoint's own purpose — drowning real violations in noise.
const CSP_MAX_BODY = 64 * 1024;
const CSP_MAX_REPORTS = 20;
const CSP_MAX_FIELD = 512;

async function handleCspReport(request) {
  if (request.method !== 'POST') return new Response('method not allowed', { status: 405 });
  if (Number(request.headers.get('Content-Length') || 0) > CSP_MAX_BODY) {
    return new Response(null, { status: 204 });
  }
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (isIsolateRateLimited('csp', ip, CSP_RATE_LIMIT, CSP_RATE_WINDOW_MS, Date.now())) {
    return new Response(null, { status: 204 });
  }
  try {
    const body = await request.json();
    const reports = (Array.isArray(body) ? body : [body]).slice(0, CSP_MAX_REPORTS);
    for (const r of reports) {
      const detail = (r && (r.body || r['csp-report'])) || r || {};
      // Truncate: these are attacker-supplied strings from an unauthenticated
      // endpoint going straight into Workers Logs.
      const field = (v) => (typeof v === 'string' ? v.slice(0, CSP_MAX_FIELD) : undefined);
      console.error('CSP violation', {
        blockedUri: field(detail['blocked-uri'] || detail.blockedURL),
        directive: field(detail['violated-directive'] || detail.effectiveDirective),
        documentUri: field(detail['document-uri'] || detail.documentURL),
      });
    }
  } catch {
    // malformed report body — nothing useful to log, don't error the request
  }
  return new Response(null, { status: 204 });
}

async function bumpCounter(env, key) {
  const kvKey = `track:${key}`;
  // Read-modify-write, not atomic — KV has no increment op. A lost update
  // under truly concurrent hits is possible; at this site's traffic that's
  // a rounding error, not a correctness bug worth a Durable Object for.
  const current = Number((await env.TICKER_KV.get(kvKey)) || 0);
  await env.TICKER_KV.put(kvKey, String(current + 1));
}

// Polled by an external uptime monitor (Uptime Kuma or similar) — reports
// whether the ticker cron is actually still running, not just whether the
// worker itself responds. console.error alone only surfaces if someone
// goes looking at Workers Logs; a monitor polling this catches the cron
// silently stopping, not just it throwing.
async function handleHealthz(env) {
  const lastSuccess = await env.TICKER_KV.get(TICKER_LAST_SUCCESS_KEY);
  if (!lastSuccess) {
    return Response.json({ ok: false, reason: 'ticker cron has never succeeded' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  const ageMs = Date.now() - Date.parse(lastSuccess);
  const ok = Number.isFinite(ageMs) && ageMs <= HEALTHZ_MAX_AGE_MS;
  return Response.json(
    { ok, lastSuccessAt: lastSuccess, ageSeconds: Math.round(ageMs / 1000) },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/ticker') return handleTicker(env, ctx);
    if (url.pathname === '/api/track') return handleTrack(request, env, ctx);
    if (url.pathname === '/api/csp-report') return handleCspReport(request);
    if (url.pathname === '/api/healthz') return handleHealthz(env);
    if (url.pathname.startsWith('/api/')) return new Response('not found', { status: 404 });
    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      fetchRecentCommits(env)
        .then((commits) => Promise.all([
          env.TICKER_KV.put(KV_KEY, JSON.stringify(commits), { expirationTtl: TICKER_TTL }),
          env.TICKER_KV.put(TICKER_LAST_SUCCESS_KEY, new Date().toISOString()),
        ]))
        .catch((err) => console.error('ticker refresh failed', err))
    );
  },
};
