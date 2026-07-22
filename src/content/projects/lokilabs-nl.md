---
title: "lokilabs.nl"
description: "This site. Astro 7, markdown, Cloudflare Pages."
tech: ["astro", "typescript", "cloudflare pages"]
repo: "https://github.com/ronaldlokers/lokilabs.nl"
link: "https://lokilabs.nl"
badge: "live"
order: 50
screenshot: /assets/projects/lokilabs-nl.png
---

The site you're reading. Markdown in, static HTML out — zero client-side
JavaScript shipped.

- **Astro 7** with typed content collections: blog and project frontmatter
  validated by zod at build time, so a bad date fails the build instead of
  the page
- Fira Code self-hosted, brand tokens as CSS custom properties, and a
  pixelized headshot as the mark
- RSS feed and sitemap generated at build
- Deployed on Cloudflare Pages: push to `main`, preview deploys per PR

Designed in Claude Design, built with Claude Code.
