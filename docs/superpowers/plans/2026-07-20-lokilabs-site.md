# lokilabs.nl Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Static personal site for lokilabs.nl — Astro 7, markdown content (blog + projects + about), Loki Labs brand, deployed on Cloudflare Pages.

**Architecture:** Astro 7 static output, zero client JS. Two content collections (`blog`, `projects`) with zod-validated frontmatter plus a single `about.md`. One `Base.astro` layout carries header/footer/SEO; pages query collections. Brand lives in CSS custom properties in one global stylesheet.

**Tech Stack:** Astro 7.1, pnpm, TypeScript, @fontsource/fira-code, @astrojs/sitemap, @astrojs/rss, Cloudflare Pages.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-20-lokilabs-site-design.md` — it wins on conflict.
- Astro **7.x** (latest 7.1 at planning time). Static output only, **zero client-side JS**.
- Package manager **pnpm**; Node pinned via `mise.toml`.
- Palette (exact): `--orange: #E9622E; --orange-light: #F67D51; --orange-deep: #DB551D; --violet: #7541B8; --purple: #562C8B; --ink: #231E1B; --muted: #76706C; --surface: #EFEBE4; --paper: #FBF8F4; --line: #DCD6D1;`
- Type: Fira Code only, self-hosted via `@fontsource/fira-code` weights 400/500/700. No Google Fonts requests.
- Site URL `https://lokilabs.nl`. English. Dates render ISO (`YYYY-MM-DD`) — fits terminal brand.
- Portrait mark exists at `public/assets/face-violet.svg` (committed). Portrait art sits flush to the **bottom** edge of a `--surface` tile; tile radius ≈ 0.23 × size.
- Astro 7 gotchas: unclosed/invalid HTML is a build **error**; whitespace between adjacent inline elements is stripped (write explicit spaces); markdown processor is Sätteri (GFM works, no remark plugins needed here).
- Git: all work on branch `feat/site` (never commit to `main` — user rule). Conventional commit subjects, lowercase imperative.
- Commit after every task. Verification = `pnpm build` (zod validates frontmatter) + checking `dist/` output; no unit-test framework (nothing to unit test — YAGNI).
- Task 8 (copy interview) and Task 9 (GitHub/Cloudflare) are **main-thread tasks** — they need the user and `gh`/dashboard access. Do not dispatch to subagents.

## File Structure

```
mise.toml                      # node pin
package.json / pnpm-lock.yaml
astro.config.mjs               # site URL + sitemap
tsconfig.json                  # from scaffold
public/assets/face-violet.svg  # exists
public/favicon.svg             # copy of app icon
src/styles/global.css          # tokens + all styling
src/layouts/Base.astro         # shell: head/SEO, header, footer
src/components/PostList.astro  # blog post <ul> (home + blog index)
src/components/ProjectCard.astro
src/content.config.ts          # blog + projects collections
src/content/about.md
src/content/blog/*.md
src/content/projects/*.md
src/pages/index.astro
src/pages/about.astro
src/pages/blog/index.astro
src/pages/blog/[slug].astro
src/pages/projects/index.astro
src/pages/projects/[slug].astro
src/pages/rss.xml.ts
```

---

### Task 1: Scaffold Astro project

**Files:**
- Create: `mise.toml`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/pages/index.astro` (scaffold placeholder)

**Interfaces:**
- Produces: working `pnpm dev` / `pnpm build`; `astro.config.mjs` exporting `site: 'https://lokilabs.nl'`; deps `@astrojs/sitemap`, `@astrojs/rss`, `@fontsource/fira-code` installed.

- [ ] **Step 1: Branch**

```bash
git checkout -b feat/site
```

- [ ] **Step 2: Pin node via mise**

Create `mise.toml`:

```toml
[tools]
node = "22"
pnpm = "latest"
```

Run: `mise install && mise exec -- node --version` → v22.x

- [ ] **Step 3: Scaffold Astro into the existing repo**

```bash
pnpm create astro@latest . --template minimal --no-git --install --yes
```

Note: dir already has `docs/`, `public/`, `.git` — scaffold into place; if the CLI balks at non-empty dir, scaffold into `/tmp/claude-1000/**/scratchpad/astro-scaffold` and copy `package.json`, `tsconfig.json`, `astro.config.mjs`, `src/` over, then `pnpm install`.

- [ ] **Step 4: Add deps**

```bash
pnpm astro add sitemap --yes
pnpm add @astrojs/rss @fontsource/fira-code
```

- [ ] **Step 5: Configure site URL**

`astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lokilabs.nl',
  integrations: [sitemap()],
});
```

- [ ] **Step 6: .gitignore**

Ensure it contains at least:

```
node_modules/
dist/
.astro/
```

- [ ] **Step 7: Verify build**

Run: `pnpm build`
Expected: exit 0, `dist/index.html` exists.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold astro 7 project with sitemap, rss, fira code deps"
```

---

### Task 2: Brand foundation — global.css + Base layout

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `public/favicon.svg`
- Modify: `src/pages/index.astro` (placeholder using Base)

**Interfaces:**
- Produces: `Base.astro` with props `{ title: string; description: string }`, renders `<slot />` inside `<main class="wrap">`. Global CSS classes used by later tasks: `.card`, `.label`, `.note`, `.tile`, `.tag`, `.post-list`, `.prose`.

- [ ] **Step 1: Copy favicon**

```bash
cp public/assets/face-violet.svg public/favicon.svg
```

- [ ] **Step 2: Write `src/styles/global.css`**

```css
:root {
  --orange: #E9622E;
  --orange-light: #F67D51;
  --orange-deep: #DB551D;
  --violet: #7541B8;
  --purple: #562C8B;
  --ink: #231E1B;
  --muted: #76706C;
  --surface: #EFEBE4;
  --paper: #FBF8F4;
  --line: #DCD6D1;
  --mono: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: var(--mono);
  font-size: 15px;
  line-height: 1.6;
  background: var(--surface);
  color: var(--ink);
}

a { color: var(--violet); }
a:hover { color: var(--purple); }

h1, h2, h3 { letter-spacing: -0.5px; line-height: 1.2; }
h1 { font-size: 28px; margin: 0 0 8px; }
h2 { font-size: 20px; margin: 32px 0 12px; }

.wrap { max-width: 880px; margin: 0 auto; padding: 40px 24px 64px; }

/* header */
.site-header { background: var(--purple); }
.site-header__inner {
  max-width: 880px; margin: 0 auto; padding: 14px 24px;
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
}
.site-header__brand {
  display: flex; align-items: center; gap: 14px;
  text-decoration: none; color: var(--paper);
  font-size: 20px; font-weight: 700; letter-spacing: -0.5px;
}
.site-header__brand .prompt { color: var(--orange-light); }
.site-nav { margin-left: auto; display: flex; gap: 18px; }
.site-nav a {
  color: var(--paper); text-decoration: none; font-size: 13px;
}
.site-nav a:hover { color: var(--orange-light); }

/* portrait tile: art flush to bottom edge, radius ~0.23 x size */
.tile {
  width: var(--tile, 44px); height: var(--tile, 44px);
  border-radius: calc(var(--tile, 44px) * 0.23);
  overflow: hidden; background: var(--surface); flex-shrink: 0;
  display: flex; align-items: flex-end; justify-content: center;
}
.tile img { width: 106%; display: block; }

/* footer */
.site-footer {
  border-top: 1px solid var(--line);
  max-width: 880px; margin: 0 auto; padding: 24px;
  display: flex; gap: 18px; flex-wrap: wrap;
  font-size: 13px; color: var(--muted);
}
.site-footer a { color: var(--muted); }
.site-footer a:hover { color: var(--purple); }

/* shared bits */
.card {
  background: var(--paper); border: 1px solid var(--line);
  border-radius: 18px; padding: 24px;
}
.label {
  font-size: 11px; font-weight: 400; letter-spacing: 2px;
  text-transform: uppercase; color: var(--muted); margin: 0 0 16px;
}
.note { font-size: 12px; color: var(--muted); }
.tag {
  display: inline-block; font-size: 11px; color: var(--purple);
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 6px; padding: 1px 8px; margin-right: 6px;
}

.post-list { list-style: none; margin: 0; padding: 0; }
.post-list li {
  display: flex; gap: 16px; align-items: baseline; padding: 8px 0;
}
.post-list time { color: var(--muted); font-size: 13px; flex-shrink: 0; }

.prose :is(h2, h3) { margin-top: 32px; }
.prose pre {
  background: var(--ink); color: var(--paper); border-radius: 12px;
  padding: 16px; overflow-x: auto; font-size: 13px;
}
.prose code { font-size: 0.92em; }
.prose :not(pre) > code {
  background: var(--paper); border: 1px solid var(--line);
  border-radius: 4px; padding: 1px 5px;
}
.prose img { max-width: 100%; }
.prose blockquote {
  margin: 16px 0; padding: 4px 16px;
  border-left: 3px solid var(--orange); color: var(--muted);
}

@media (max-width: 640px) {
  .wrap { padding: 24px 16px 48px; }
}
```

- [ ] **Step 3: Write `src/layouts/Base.astro`**

```astro
---
import '@fontsource/fira-code/400.css';
import '@fontsource/fira-code/500.css';
import '@fontsource/fira-code/700.css';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="alternate" type="application/rss+xml" title="lokilabs" href="/rss.xml" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonical} />
    <meta name="generator" content={Astro.generator} />
  </head>
  <body>
    <header class="site-header">
      <div class="site-header__inner">
        <a class="site-header__brand" href="/">
          <span class="tile"><img src="/assets/face-violet.svg" alt="lokilabs mark" /></span>
          <span>/lokilabs <span class="prompt">$</span></span>
        </a>
        <nav class="site-nav">
          <a href="/">home</a>
          <a href="/about/">about</a>
          <a href="/blog/">blog</a>
          <a href="/projects/">projects</a>
        </nav>
      </div>
    </header>
    <main class="wrap">
      <slot />
    </main>
    <footer class="site-footer">
      <a href="https://github.com/ronaldlokers">github</a>
      <a href="https://www.linkedin.com/in/ronaldlokers">linkedin</a>
      <a href="mailto:ronald@lokilabs.nl">ronald@lokilabs.nl</a>
      <span>© {new Date().getFullYear()} Ronald Lokers</span>
    </footer>
  </body>
</html>
```

(LinkedIn URL is provisional — Task 8 confirms with user.)

- [ ] **Step 4: Placeholder `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="lokilabs — Ronald Lokers" description="Personal site of Ronald Lokers.">
  <h1>/lokilabs $</h1>
  <p>placeholder — replaced in task 4</p>
</Base>
```

- [ ] **Step 5: Verify**

Run: `pnpm build`
Expected: exit 0. `grep -c 'site-header' dist/index.html` → ≥1. `grep -c 'fonts.googleapis' dist/index.html` → 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add brand tokens, base layout with header and footer"
```

---

### Task 3: Content collections + seed content

**Files:**
- Create: `src/content.config.ts`, `src/content/about.md`, `src/content/blog/hello-world.md`, `src/content/projects/lokilabs-nl.md`

**Interfaces:**
- Produces: collections `blog` and `projects` queryable via `getCollection('blog')` / `getCollection('projects')`. Blog entry data: `{ title, description, pubDate: Date, updatedDate?, tags: string[], draft: boolean }`. Project entry data: `{ title, description, tech: string[], repo?, link?, order: number, draft: boolean }`. Entry URL slug = `entry.id` (filename without extension).

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    link: z.string().url().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, projects };
```

- [ ] **Step 2: Seed `src/content/about.md`**

```markdown
---
title: About
---

Placeholder about text — replaced with real copy in task 8.
```

- [ ] **Step 3: Seed `src/content/blog/hello-world.md`**

```markdown
---
title: "hello world"
description: "First post on lokilabs.nl — placeholder."
pubDate: 2026-07-20
tags: ["meta"]
---

Placeholder post body — replaced with real copy in task 8.
```

- [ ] **Step 4: Seed `src/content/projects/lokilabs-nl.md`**

```markdown
---
title: "lokilabs.nl"
description: "This site. Astro 7, markdown, Cloudflare Pages."
tech: ["astro", "typescript", "cloudflare pages"]
repo: "https://github.com/ronaldlokers/lokilabs.nl"
order: 0
---

Placeholder writeup — replaced with real copy in task 8.
```

- [ ] **Step 5: Verify schemas bite**

Run: `pnpm build` → exit 0.
Then temporarily remove the `description` line from `hello-world.md`, run `pnpm build` → expect **failure** mentioning the blog collection/description. Restore the line, `pnpm build` → exit 0 again.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add blog and projects collections with seed content"
```

---

### Task 4: Home page

**Files:**
- Create: `src/components/PostList.astro`, `src/components/ProjectCard.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Base.astro` (Task 2), collections (Task 3).
- Produces: `PostList.astro` props `{ posts: CollectionEntry<'blog'>[] }`; `ProjectCard.astro` props `{ project: CollectionEntry<'projects'> }`. Both reused by index pages in Tasks 6–7.

- [ ] **Step 1: Write `src/components/PostList.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  posts: CollectionEntry<'blog'>[];
}
const { posts } = Astro.props;
const iso = (d: Date) => d.toISOString().slice(0, 10);
---
<ul class="post-list">
  {posts.map((post) => (
    <li>
      <time datetime={iso(post.data.pubDate)}>{iso(post.data.pubDate)}</time>
      <a href={`/blog/${post.id}/`}>{post.data.title}</a>
    </li>
  ))}
</ul>
```

- [ ] **Step 2: Write `src/components/ProjectCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  project: CollectionEntry<'projects'>;
}
const { project } = Astro.props;
---
<article class="card">
  <h3 style="margin: 0 0 6px;"><a href={`/projects/${project.id}/`}>{project.data.title}</a></h3>
  <p style="margin: 0 0 12px;">{project.data.description}</p>
  <p style="margin: 0;">
    {project.data.tech.map((t) => <span class="tag">{t}</span>)}
  </p>
</article>
```

- [ ] **Step 3: Rewrite `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import PostList from '../components/PostList.astro';
import ProjectCard from '../components/ProjectCard.astro';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);
const projects = (await getCollection('projects', ({ data }) => !data.draft))
  .sort((a, b) => a.data.order - b.data.order)
  .slice(0, 3);
---
<Base
  title="lokilabs — Ronald Lokers"
  description="TypeScript developer going deep on platform engineering and AI. Personal site of Ronald Lokers."
>
  <section style="display: flex; align-items: center; gap: 26px; flex-wrap: wrap; margin: 24px 0 32px;">
    <span class="tile" style="--tile: 104px;"><img src="/assets/face-violet.svg" alt="lokilabs mark" /></span>
    <span>
      <span style="display: block; font-size: 16px; font-weight: 700; color: var(--violet);">Ronald Lokers <span style="color: var(--orange-deep); font-weight: 500;">→</span></span>
      <span style="display: block; font-size: 38px; font-weight: 700; letter-spacing: -1.5px;">/lokilabs <span style="color: var(--orange);">$</span></span>
    </span>
  </section>

  <p>
    Placeholder positioning paragraph — replaced with real copy in task 8.
  </p>

  <h2>latest posts</h2>
  <PostList posts={posts} />
  <p class="note"><a href="/blog/">all posts →</a> · <a href="/rss.xml">rss</a></p>

  <h2>projects</h2>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
    {projects.map((p) => <ProjectCard project={p} />)}
  </div>
  <p class="note"><a href="/projects/">all projects →</a></p>
</Base>
```

- [ ] **Step 4: Verify**

Run: `pnpm build`
Expected: exit 0. `grep -c 'hello world' dist/index.html` → ≥1. `grep -c 'lokilabs.nl' dist/index.html` → ≥1 (project card).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add home page with lockup, latest posts, featured projects"
```

---

### Task 5: About page

**Files:**
- Create: `src/pages/about.astro`

**Interfaces:**
- Consumes: `src/content/about.md` (Task 3), `Base.astro`.

- [ ] **Step 1: Write `src/pages/about.astro`**

About lives outside collections, so import it as a markdown module:

```astro
---
import Base from '../layouts/Base.astro';
import { Content } from '../content/about.md';
---
<Base title="about — lokilabs" description="Who Ronald Lokers is and what Loki Labs is about.">
  <h1>about</h1>
  <div class="prose">
    <Content />
  </div>
</Base>
```

Note: if the markdown-module import gives trouble under Astro 7's Sätteri processor, fall back: move the prose inline into `about.astro` as HTML and delete `src/content/about.md`. Prefer the markdown import.

- [ ] **Step 2: Verify**

Run: `pnpm build`
Expected: exit 0, `dist/about/index.html` exists and contains "Placeholder about".

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add about page rendered from markdown"
```

---

### Task 6: Blog — index, post page, RSS

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/rss.xml.ts`

**Interfaces:**
- Consumes: `blog` collection, `PostList.astro`, `Base.astro`.
- Produces: routes `/blog/`, `/blog/<id>/`, `/rss.xml`.

- [ ] **Step 1: Write `src/pages/blog/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import PostList from '../../components/PostList.astro';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<Base title="blog — lokilabs" description="Posts by Ronald Lokers on TypeScript, platform engineering, and AI.">
  <h1>blog</h1>
  <PostList posts={posts} />
  <p class="note"><a href="/rss.xml">rss feed</a></p>
</Base>
```

- [ ] **Step 2: Write `src/pages/blog/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
const iso = (d: Date) => d.toISOString().slice(0, 10);
---
<Base title={`${post.data.title} — lokilabs`} description={post.data.description}>
  <h1>{post.data.title}</h1>
  <p class="note">
    <time datetime={iso(post.data.pubDate)}>{iso(post.data.pubDate)}</time>
    {post.data.updatedDate && <span> · updated {iso(post.data.updatedDate)}</span>}
    {post.data.tags.length > 0 && <span> · {post.data.tags.map((t) => <span class="tag">{t}</span>)}</span>}
  </p>
  <div class="prose">
    <Content />
  </div>
</Base>
```

- [ ] **Step 3: Write `src/pages/rss.xml.ts`**

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return rss({
    title: 'lokilabs',
    description: 'Posts by Ronald Lokers on TypeScript, platform engineering, and AI.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

- [ ] **Step 4: Verify**

Run: `pnpm build`
Expected: exit 0. `dist/blog/index.html`, `dist/blog/hello-world/index.html`, `dist/rss.xml` all exist. `grep -c '<item>' dist/rss.xml` → 1.

- [ ] **Step 5: Draft exclusion check**

Add `draft: true` to `hello-world.md` frontmatter, `pnpm build`: `dist/blog/hello-world/` must NOT exist and `grep -c '<item>' dist/rss.xml` → 0. Revert to `draft` absent, rebuild.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add blog index, post pages, rss feed"
```

---

### Task 7: Projects — index + project page

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`

**Interfaces:**
- Consumes: `projects` collection, `ProjectCard.astro`, `Base.astro`.
- Produces: routes `/projects/`, `/projects/<id>/`.

- [ ] **Step 1: Write `src/pages/projects/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import ProjectCard from '../../components/ProjectCard.astro';

const projects = (await getCollection('projects', ({ data }) => !data.draft))
  .sort((a, b) => a.data.order - b.data.order);
---
<Base title="projects — lokilabs" description="Things Ronald Lokers builds.">
  <h1>projects</h1>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
    {projects.map((p) => <ProjectCard project={p} />)}
  </div>
</Base>
```

- [ ] **Step 2: Write `src/pages/projects/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects', ({ data }) => !data.draft);
  return projects.map((project) => ({ params: { slug: project.id }, props: { project } }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---
<Base title={`${project.data.title} — lokilabs`} description={project.data.description}>
  <h1>{project.data.title}</h1>
  <p class="note">
    {project.data.tech.map((t) => <span class="tag">{t}</span>)}
    {project.data.repo && <span> · <a href={project.data.repo}>repo</a></span>}
    {project.data.link && <span> · <a href={project.data.link}>live</a></span>}
  </p>
  <div class="prose">
    <Content />
  </div>
</Base>
```

- [ ] **Step 3: Verify**

Run: `pnpm build`
Expected: exit 0. `dist/projects/index.html` and `dist/projects/lokilabs-nl/index.html` exist. `dist/sitemap-index.xml` exists.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add projects index and project pages"
```

---

### Task 8: Copy interview + real content (MAIN THREAD — needs user)

**Files:**
- Modify: `src/content/about.md`, `src/content/blog/hello-world.md`, `src/content/projects/*.md`, `src/pages/index.astro` (positioning paragraph), `src/layouts/Base.astro` (LinkedIn URL)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Interview user** — one question at a time, tone terminal-nerd playful, English:
  - Home positioning paragraph (builder-in-transition framing): current role/employer status, what they're building toward, one hobby/human detail.
  - About: career story so far, TS background highlights, why the pivot, what Loki Labs name means to them.
  - Projects: list 2–3 real projects (name, one-liner, tech, repo URL).
  - First post: angle for "hello world / why lokilabs".
  - LinkedIn profile URL (exact).
- [ ] **Step 2: Write copy** into the files above; keep frontmatter schema-valid.
- [ ] **Step 3: Verify** — `pnpm build` exit 0; read pages via `pnpm preview` and check no "Placeholder" string remains: `grep -ri placeholder dist/ | wc -l` → 0.
- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add launch copy for home, about, blog, projects"
```

---

### Task 9: GitHub + PR + Cloudflare Pages (MAIN THREAD — needs gh/dashboard)

**Files:** none new (README optional, skip — YAGNI).

- [ ] **Step 1: Create GitHub repo and push**

```bash
gh repo create ronaldlokers/lokilabs.nl --public --source . --push
git push -u origin feat/site
```

- [ ] **Step 2: Open PR**

```bash
gh pr create --title "feat: lokilabs.nl site" --body "Astro 7 static site per docs/superpowers/specs/2026-07-20-lokilabs-site-design.md"
```

- [ ] **Step 3: User merges PR** after review.

- [ ] **Step 4: Cloudflare Pages (manual, user does in dashboard)** — document for user:
  1. Cloudflare dashboard → Workers & Pages → Create → Pages → connect `ronaldlokers/lokilabs.nl`.
  2. Build command `pnpm build`, output dir `dist`, production branch `main`.
  3. Custom domain: add `lokilabs.nl` (DNS already at Cloudflare per spec assumption).
  4. Email routing for ronald@lokilabs.nl: dashboard → Email → Email Routing → add address, forward to ronald@lokers.email.

- [ ] **Step 5: Verify production** — after first deploy, `curl -sI https://lokilabs.nl` → 200; spot-check `/blog/`, `/rss.xml`, `/sitemap-index.xml`.
