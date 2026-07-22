---
name: visual-verify
description: Screenshot-verify site changes with headless chromium CLI. Use after ANY visual change — layout, CSS, new components, diagrams, generated images — before pushing, and whenever the user reports "it looks wrong on mobile/desktop". Also the fallback whenever the chrome-devtools MCP screenshot times out (it frequently does).
---

# visual-verify — see the change before shipping it

The chrome-devtools MCP screenshot regularly hangs with
`Page.captureScreenshot timed out`. Don't fight it: the chromium CLI is
deterministic and fast. Verify every visual change by actually looking at a
rendered screenshot — markup greps prove presence, not appearance.

## 1. Preview server

```bash
curl -so /dev/null -w '%{http_code}' http://localhost:4322/ ||
  { (mise exec -- pnpm preview --port 4322 &>/dev/null &); sleep 3; }
```

Preview serves `dist/` — run `mise exec -- pnpm build` first or you're
looking at stale output.

## 2. Capture

```bash
chromium --headless=new --disable-gpu --no-sandbox \
  --virtual-time-budget=6000 \
  --screenshot=<out.png> --window-size=1000,2400 --hide-scrollbars \
  http://localhost:4322/<page>/
```

- `--virtual-time-budget` matters: without it, screenshots race webfont
  loading and text renders in the fallback font.
- Mobile check: `--window-size=375,900`.
- Works on `file://` URLs too (SVGs, generated HTML cards).

## 3. Crop + look

```bash
magick <out.png> -crop <WxH+X+Y> +repage <zoom.png>
```

Then **Read the png** and actually judge it: text inside boxes, alignment
against the header, hover-independent states, nothing clipped. If a region is
unexpectedly blank, the crop offset is wrong — crop wider before concluding
the page is broken.

## Gotchas learned the hard way

- Full-page screenshots scale with the window's device-pixel ratio —
  **measure** an element of known CSS width in the output before computing
  crop coordinates; don't assume 1:1.
- `rsvg-convert` cannot render mermaid/foreignObject SVGs (text disappears) —
  chromium CLI is the only reliable rasterizer for those.
- SVGs loaded via `<img>` can't use page fonts; if a diagram shows fallback
  fonts, the font must be embedded in the SVG itself (see
  `scripts/render-diagram.sh`).
