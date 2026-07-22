---
name: brand-assets
description: Generate any Loki Labs visual asset — OG/social cards, banners, icons/favicons, portrait tiles, terminal-card screenshots. Use whenever the user asks for an image, card, banner, icon, social preview, or screenshot-style graphic, and when refreshing project screenshots. Contains the satori and imagemagick recipes with their gotchas.
---

# brand-assets — generating Loki Labs visuals

Palette: purple `#562C8B` · violet `#7541B8` · orange `#E9622E` / light
`#F67D51` · ink `#231E1B` · surface `#EFEBE4` · paper `#FBF8F4` · terminal ink
`#14100D` / bar `#1E1915`. Type: Fira Code only.

## Fonts (two sources, two uses)

- **TTF** in `src/assets/fonts/` — for satori and for the render-diagram
  XDG trick.
- **woff2** in `node_modules/@fontsource/fira-code/files/` — for embedding
  into SVGs as data-URI `@font-face` (SVGs in `<img>` can't use page fonts).

## OG / social cards

`src/lib/og.ts` + `src/pages/og/[...slug].png.ts` generate all page cards at
build. New pages get cards automatically; repo social previews are just
`dist/og/projects/*.png` (GitHub upload is manual, Settings → Social preview).

## One-off satori renders (banner-style)

Pattern from the LinkedIn banner: node script in repo root (deps resolve),
`el()` helper building React-shaped objects. Two gotchas that cost time:
- satori requires explicit `display: flex` on every multi-child div — bake
  `display: 'flex'` as a default into the `el()` helper;
- font family must be a **single name** (`Fira Code`), never a comma list —
  satori/mermaid treat a quoted list as one unmatchable name.

## Portrait tiles / icons

App-icon recipe (favicon, manifest icons, OG tile):

```bash
magick -size 1024x1024 xc:'#EFEBE4' \
  \( public/assets/face-line-violet.png -resize 1085x1085 \) -geometry -30-32 -composite tile.png
magick tile.png \( -size 1024x1024 xc:none -draw "roundrectangle 0,0,1023,1023,236,236" \) \
  -alpha set -compose DstIn -composite tile-round.png
```

Radius = 0.23 × size; art bottom-flush at 106% width. Quantize exports
(`-colors 64`) — line art compresses hugely.

## Terminal-card screenshots

Card HTML pattern lives in scratchpad history and in the committed cards'
look: `#14100D` body, `#1E1915` bar with dots (orange/purple/grey) absolute
left and the title centered, prompt `ronald → host $` in violet/orange.
Render + crop via the **visual-verify** skill. Keep card style in sync with
the expressive-code terminal frames on the site.
