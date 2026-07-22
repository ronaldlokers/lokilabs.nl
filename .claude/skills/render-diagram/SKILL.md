---
name: render-diagram
description: Create or update brand-styled diagrams from Mermaid sources. Use whenever the user wants a diagram, architecture drawing, or flowchart on the site, or edits any .mmd in src/assets/diagrams/. The render script handles the two font traps — read this instead of rendering mermaid ad hoc.
---

# render-diagram — Mermaid → brand SVG

Sources live in `src/assets/diagrams/*.mmd`; rendered SVGs in
`public/assets/projects/`. Render locally, commit **both** files together —
Cloudflare CI has no chromium.

```bash
mise exec -- bash scripts/render-diagram.sh \
  src/assets/diagrams/<name>.mmd public/assets/projects/<name>.svg
```

The script encodes two hard-won font rules — don't bypass it:
1. the render browser gets Fira Code as a *system* font (scoped
   `XDG_DATA_HOME`) so mermaid **measures** labels with real metrics; a
   css-only font loses the load race and labels clip;
2. the output embeds woff2 as data-URI `@font-face` so visitors' browsers
   render Fira Code inside `<img>`.

## Theming conventions (copy from homelab-architecture.mmd)

- `init` block: `"fontFamily": "Fira Code"` — **single name only**, a comma
  list becomes one unmatchable family; `flowchart.padding: 14` so labels
  never touch box edges.
- themeVariables: `lineColor #E9622E`, `clusterBkg #EFEBE4`, borders
  `#DCD6D1`, backgrounds `#FBF8F4`.
- classDefs: `purple` (fill #562C8B, paper text) for the protagonist node;
  `node` (violet bold text) for members; `ghost` (dashed, muted) for
  supporting cast; `note` (surface fill, faint text) for annotations.

## Verify

Rasterize with the **visual-verify** skill (chromium CLI — rsvg cannot render
mermaid's foreignObject labels) and check: no clipped text, brand colors,
Fira Code everywhere.
