# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: hiring managers, recruiters, and engineering leads screening Ronald
Lokers for a platform or DevOps engineering role.** They arrive from a CV, a
LinkedIn profile, or an application, spend a few minutes, and are deciding
whether to reply. They need to resolve one doubt fast: 15 years of
TypeScript/frontend is on paper — can he actually do platform work?

**Secondary: engineering peers** arriving from a post, a repo link, or a
social share. They are not hiring; they are reading for the technical
substance (Kubernetes on Raspberry Pi CM5, GitOps, observability, terminal
tooling) and decide whether Ronald is worth following.

Both audiences are real. When their needs conflict, the hiring decision wins.

## Product Purpose

lokilabs.nl is Ronald Lokers' personal site — portfolio, writing, and CV. It
exists to convert a screening visit into contact.

Success is **inbound contact**: a CV opened, a `mailto:` clicked, an interview
request that lands in the inbox. This is measured, not assumed — `/api/track`
is a first-party, no-cookie event counter for exactly these two actions.
Readership and reputation are supporting outcomes, not the goal.

## Positioning

A frontend engineer in a deliberate, evidenced transition to platform
engineering — not a claim, a paper trail. The differentiator a neighbouring
portfolio cannot truthfully copy is the combination:

- 15+ years of shipped frontend at real scale (Coolblue through explosive
  growth, Mendix Studio's Page Editor used by thousands of developers, Oliver
  IT consultancy);
- a homelab run like production, not like a demo — a three-node HA Raspberry
  Pi CM5 Kubernetes cluster, FluxCD GitOps, full Prometheus/Grafana
  observability, public repo;
- the site itself as an artifact of the same discipline — Cloudflare Workers,
  cron-refreshed live GitHub ticker, healthcheck endpoint, CSP reporting,
  branch protection with required CI.

Voice: terminal-nerd playful. Lowercase, prompt lines, dry humour, no
corporate-portfolio gloss. Hero commitment: "Do it twice? I'll automate it."

## Operating Context

- Read on desktop and mobile, often in a fast screening pass between other
  tabs; the visitor may never scroll past the first viewport.
- Surfaces: home (hero, about, writing, projects), `/writing/`, `/projects/`,
  `/about`, `/cv`, `/privacy`, `404`.
- Navigation is a "living terminal" SPA overlay — writing posts, projects and
  the CV open in a hash-routed modal over real URLs, with a server-rendered
  fallback for crawlers and no-JS visitors.
- The CV is a first-class destination, not a footnote; opening it is a
  tracked conversion.
- Contact is direct email (`ronald@lokilabs.nl`). There is no form, no
  scheduling tool, no chat.

## Capabilities and Constraints

- **Stack:** Astro 7, no client framework, content collections (`writing`,
  `projects`) validated by a Zod schema in `src/content.config.ts`. Deployed
  as a Cloudflare Worker fronting static assets; only `/api/*` reaches the
  Worker.
- **Live data:** `/api/ticker` serves real recent GitHub commits, cached in
  KV and refreshed hourly by a Cron Trigger. `/api/healthz` reports whether
  that cron is still running. `/api/track` counts CV opens and contact
  clicks — first-party, no cookies.
- **Ranking:** project `order` is a manual ranking key, not a date; `badge`
  styling is keyed off exact strings in `home.css`.
- **No staging.** `main` is production; every merge deploys. Branch
  protection requires a passing `check-build` PR check.
- **Privacy posture:** no cookies, no third-party analytics. Any future
  addition must keep that true or change the privacy page with it.
- **The homelab is not publicly reachable.** Live cluster metrics, uptime
  dashboards, or embedded Grafana are not possible and must never be
  implied.
- Undecided: whether the site ever carries commercial/freelance offerings.
  Today it does not.

## Brand Commitments

Binding, confirmed by the user — not open to redesign:

- **The terminal / CLI metaphor.** Prompt lines, the living-terminal overlay,
  monospace-first typography, lowercase terminal voice. This is the identity,
  not a decoration.
- **The violet line-art portrait mark** — `public/assets/face-line-violet.png`,
  a line-art headshot of Ronald (not the `face-vector*` pixel-trace variants,
  and never described as a fox). Tile treatment: `#EFEBE4` background, radius
  0.23 × size, art bottom-flush at 106% width.
- Name: Loki Labs / lokilabs.nl. The phrase "Loki Labs design system" never
  appears in site copy.
- Brand source of truth lives in the Claude design project "Loki Labs
  branding design"; local sync copies in `docs/design-sync/`.

## Evidence on Hand

Real, shipped, and usable:

- Work history with named employers and concrete outcomes (`src/data/history.ts`)
  — Coolblue, Mendix, Oliver IT, Redhotminute, medianerds, Pixel Reclame,
  Crea10. Leaf Boox and MODx forum moderation are deliberately excluded.
- Six projects with screenshots (`src/content/projects/`, assets in
  `public/assets/projects/`): homelab, dotfiles, lokilabs-nl, sugarrush,
  walkfit, zenith.
- Four writing posts (`src/content/writing/`) on blood glucose in the
  terminal, building with Claude Code, frontend → platform, and three control
  planes on Raspberry Pi.
- Public repos, including `github.com/ronaldlokers/homelab`.
- Live GitHub commit activity via the ticker.
- A homelab architecture diagram (`src/assets/diagrams/homelab-architecture.mmd`).

**Absent — must never be fabricated:** testimonials, client quotes, customer
logos, employer endorsements, user counts, performance benchmarks not already
in the content, certifications, and any live homelab telemetry.

## Product Principles

1. **Answer the doubt in the first viewport.** The screening visitor's
   question is "can a frontend guy do platform work?" Every surface either
   answers it or gets out of the way.
2. **Evidence over adjectives.** Repos, diagrams, commits, and named outcomes
   carry the claim. Nothing gets asserted that a link cannot back.
3. **Contact is the conversion.** CV and email are always reachable and
   always tracked; no surface may bury them.
4. **The site is the portfolio.** Craft, performance, and operational rigour
   in the implementation are themselves the argument.
5. **Terminal voice, human warmth.** Playful and lowercase, never cold — a
   person is being hired, not a CLI.

## Accessibility & Inclusion

No product-specific standard was established beyond the general expectation
that the site works for keyboard and screen-reader users. Two structural
requirements do bind: the living-terminal overlay must remain a correct modal
dialog (focus management, escape, labelled), and every SPA-routed destination
must stay reachable as a real server-rendered URL for crawlers and no-JS
visitors.
