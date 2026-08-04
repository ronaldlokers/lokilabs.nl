# lokilabs.nl

Ronald Lokers' personal site — portfolio, writing, and CV. Astro 7, deployed
as a Cloudflare Worker (static assets + one small API route).

## Stack

- **Astro 7** — content collections for `writing`/`projects` (markdown +
  Zod schema, see `src/content.config.ts`), server-rendered pages, no
  client framework.
- **`src/scripts/living-terminal.js`** — the "living terminal" SPA layer:
  client-routes writing posts, projects, and the CV into a modal overlay
  (real URLs + History API, with a server-rendered fallback for crawlers
  and no-JS) instead of full page navigations.
- **Cloudflare Workers** — `src/worker/index.js` fronts the static build.
  Only `/api/*` hits the Worker (see `wrangler.jsonc`'s
  `assets.run_worker_first`); everything else is plain static passthrough.
  It serves `/api/ticker` (real recent GitHub commits, cached in KV,
  refreshed hourly by a Cron Trigger) and `/api/track` (a first-party,
  no-cookie event counter for CV opens and contact clicks).

## Local dev

Requires Node ≥22.12 and pnpm (pinned via `packageManager` in
`package.json` — use [mise](https://mise.jdx.dev/) or your tool of choice
to pick that version up automatically).

```bash
pnpm install
pnpm dev       # astro dev — hot reload, no Worker (KV/ticker won't resolve)
pnpm build     # astro build -> dist/
pnpm preview   # serve dist/ statically
```

To test the Worker itself (KV, `/api/ticker`, `/api/track`, the cron
handler) locally, use Wrangler directly against the built output:

```bash
pnpm build
npx wrangler dev
# manually trigger the cron handler:
curl "http://localhost:8787/cdn-cgi/handler/scheduled"
```

## Deploy

Cloudflare Workers Builds auto-deploys on every push to `main`. There's no
staging environment — `main` is production. Branch protection requires a
PR with the `check-build` CI check (type-check + build + link check)
passing before merge, enforced even for repo admins; a
`post-deploy-smoke` workflow re-checks the live site after each deploy
lands (see `.github/workflows/`).

### Rolling back a bad deploy

There's no staging, so a bad merge is live. Two options, and the first is
almost always the right one — reverting through git needs a PR and a full CI
pass (type-check, build, Playwright, link check), which is several minutes
during which production stays broken.

**Fastest — roll back the Worker itself** (seconds, no repo change):

Cloudflare dashboard → Workers & Pages → `lokilabs-nl` → Deployments → pick
the last good deployment → **Rollback**. Or with wrangler:

```bash
npx wrangler deployments list              # find the last good version id
npx wrangler rollback <version-id>
```

This reverts the deployed Worker and its static assets. It does **not**
touch `main`, so the repo and production are now out of sync — the offending
commit still has to be reverted afterwards, or the next merge redeploys it.

**Then — fix the repo**, at normal speed:

```bash
git checkout main && git pull
git checkout -b fix/revert-<topic>
git revert <bad-sha>
```

then open a PR as usual. Once it merges, production and `main` agree again.

Notes:
- **KV survives a rollback.** Ticker cache, conversion counters and the cron
  heartbeat all live in `TICKER_KV` and are unaffected — a rollback cannot
  restore a counter that a bad deploy corrupted or a bad key deleted.
- **Cron triggers follow the deployed Worker**, so a rollback restores the
  previous `scheduled` handler too.
- `/api/healthz` is checked by `post-deploy-smoke` and polled externally; if
  it reports unhealthy after a rollback, the cron hasn't run since — wait one
  hour or trigger it manually (see Local dev).

### One-time setup for a fresh clone or fork

The KV namespace ID in `wrangler.jsonc` is tied to this Cloudflare
account. A fresh deploy target needs its own:

```bash
npx wrangler kv namespace create TICKER_KV
# paste the returned id into wrangler.jsonc's kv_namespaces[0].id
```

Optionally, raise the ticker's GitHub API rate limit from 60/hr to
5000/hr (no token scopes needed — everything it reads is public):

```bash
gh auth token | npx wrangler secret put GITHUB_TOKEN
```

`/api/healthz` reports whether the hourly ticker cron is actually still
running — `200` if it succeeded within the last ~2 hours (one missed run
tolerated), `503` otherwise, with a JSON body giving the last success time.
Point an external uptime monitor (e.g. Uptime Kuma) at it to catch the cron
silently stopping — `console.error` alone only shows up if someone happens
to check the Workers Logs.

## Adding content

Drop a markdown file in `src/content/writing/` or `src/content/projects/`
— frontmatter is validated against the Zod schema in
`src/content.config.ts` (see the inline comments there for what each
project field controls, in particular `order`, which is a manual ranking
key, not a date).
