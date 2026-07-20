# lokilabs.nl — personal website design

Date: 2026-07-20
Status: approved in conversation, pending written review

## Purpose

Digital home base for Ronald Lokers' personal brand, Loki Labs. Central hub:
who Ronald is, what they build, links out to GitHub/LinkedIn/email. Blog and
projects support the hub.

Positioning: **builder in transition** — strong TypeScript foundation, actively
going deep on DevOps / platform engineering / AI engineering. The blog
documents that journey.

Language: English. Tone: terminal-nerd playful — matches the `/lokilabs $`
brand; dry humor, short sentences, technical but human.

## Stack

- **Astro 7.1** (latest at time of writing), fully static output, zero client
  JS at launch. Verify v7 conventions against current Astro docs during
  implementation — the content collections API and config shapes below are
  written from v5 knowledge and must be checked.
- Node pinned via `mise.toml` in the project; package manager pnpm.
- Git repo in this directory, pushed to GitHub `ronaldlokers/lokilabs.nl`.
- Deploy: **Cloudflare Pages**, production branch `main`, build `pnpm build`,
  output `dist/`. Preview deploys per PR.

## Repository structure

```
src/
  content.config.ts      # collections: blog, projects (zod schemas)
  content/
    about.md             # about page prose
    blog/*.md
    projects/*.md
  layouts/Base.astro     # shell: header, footer, meta/SEO
  pages/
    index.astro          # home
    about.astro          # renders content/about.md
    blog/index.astro     # post list
    blog/[slug].astro    # post page
    projects/index.astro # project cards
    projects/[slug].astro# project writeup
    rss.xml.ts           # blog RSS
  styles/global.css      # brand tokens + base styles
public/
  assets/                # portrait mark SVGs from design project
  favicon.svg
docs/superpowers/specs/  # this spec, plans
mise.toml
astro.config.mjs
package.json
```

## Content model

`blog` collection (markdown + typed frontmatter, zod):

```ts
{
  title: string,
  description: string,
  pubDate: date,
  updatedDate?: date,
  tags: string[]        // default []
  draft: boolean        // default false
}
```

Drafts are excluded from build output and RSS.

`projects` collection:

```ts
{
  title: string,
  description: string,  // one-liner for the card
  tech: string[],       // tags shown on card
  repo?: url,           // GitHub link
  link?: url,           // live site
  order: number,        // default 0, sort ascending on index
  draft: boolean        // default false
}
```

Markdown body = the per-project writeup page.

About: single `src/content/about.md`, rendered by `about.astro`.

## Brand / theming

Source of truth: "Loki Labs Handoff" page in the Claude design project
"Loki Labs branding design" (project id `aeb25f86-af30-4bf8-9596-664b5cc2a38a`).

CSS custom properties in `global.css`:

```css
--orange: #E9622E;   --orange-light: #F67D51;  --orange-deep: #DB551D;
--violet: #7541B8;   --purple: #562C8B;
--ink: #231E1B;      --muted: #76706C;
--surface: #EFEBE4;  --paper: #FBF8F4;         --line: #DCD6D1;
```

- Type: Fira Code for everything, self-hosted via `@fontsource/fira-code`
  (weights 400/500/700). No Google Fonts request.
- Page background `--surface`; cards `--paper` with 1px `--line` border,
  border-radius 18px (matches handoff cards).
- Logo: portrait SVGs copied from the design project (`face-vector-violet.svg` and
  variants) into `public/assets/`. Portrait art sits flush to the bottom edge of a
  `--surface` tile; tile radius ≈ 0.23 × size.
- Header logo: portrait tile + `/lokilabs $` wordmark on `--purple` bar
  (text `--paper`, `$` in `--orange-light`), per handoff spec.
- Primary lockup (home hero): portrait tile 104px/radius 24px +
  "Ronald Lokers →" (`--violet`, arrow `--orange-deep`) over
  `/lokilabs $` (`--ink`, `$` in `--orange`).
- Links `--violet`, hover `--purple`. Accents orange.
- Light theme only at launch; handoff defines no dark palette.

## Pages

- **Home**: primary lockup, one-paragraph builder-in-transition positioning,
  latest 3 blog posts, featured projects, links row.
- **About**: prose from `about.md`.
- **Blog index**: date-sorted post list with tags.
  **Post page**: title, date, tags, prose. RSS at `/rss.xml`.
- **Projects index**: cards (title, one-liner, tech tags) linking to writeups.
  **Project page**: markdown writeup, repo/live links.
- Header nav: home / about / blog / projects.
  Footer: GitHub (github.com/ronaldlokers), LinkedIn, ronald@lokilabs.nl,
  © current year.
- SEO: per-page title/description, OG tags, `@astrojs/sitemap`, canonical
  URLs on `https://lokilabs.nl`.

## Launch content

Filled via a copy interview after scaffolding:

- Home positioning paragraph
- About page prose
- 1 first blog post (hello world / why lokilabs)
- 2–3 project pages
- LinkedIn profile URL for the footer

## Deployment & verification

- Cloudflare Pages connected to the GitHub repo. Production: push to `main`.
  PRs get preview deploys.
- No extra CI at launch; Astro build validates frontmatter via zod schemas.
- Local: `pnpm dev` for development, `pnpm build && pnpm preview` to verify.
- Email `ronald@lokilabs.nl` requires Cloudflare Email Routing setup —
  outside this repo's scope, noted as a manual step.

## Out of scope (launch)

- Dark theme
- Client-side JS / interactivity
- Comments, analytics, search
- Dutch translation
