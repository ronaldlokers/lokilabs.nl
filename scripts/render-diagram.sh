#!/usr/bin/env bash
# Render a mermaid diagram to a self-contained brand SVG.
# Usage: scripts/render-diagram.sh src/assets/diagrams/homelab-architecture.mmd public/assets/projects/homelab-architecture.svg
#
# Two font tricks, both required:
#  - the render browser needs Fira Code as a SYSTEM font (scoped XDG_DATA_HOME)
#    so mermaid MEASURES labels with the real metrics — a css @font-face alone
#    loses the race and boxes get sized for the fallback font;
#  - the output embeds the woff2 as data-URI @font-face so visitors' browsers
#    render it inside <img> where page fonts don't reach.
set -euo pipefail

SRC="$1"
OUT="$2"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$WORK/xdg/fonts"
cp src/assets/fonts/FiraCode-Regular.ttf src/assets/fonts/FiraCode-Bold.ttf "$WORK/xdg/fonts/"
fc-cache -f "$WORK/xdg/fonts" >/dev/null 2>&1 || true

python3 - "$WORK/fira.css" <<'EOF'
import base64, glob, sys
def face(path, weight):
    b64 = base64.b64encode(open(path, 'rb').read()).decode()
    return ("@font-face{font-family:'Fira Code';font-weight:%s;font-style:normal;"
            "src:url(data:font/woff2;base64,%s) format('woff2');}\n" % (weight, b64))
reg = glob.glob('node_modules/@fontsource/fira-code/files/fira-code-latin-400-normal.woff2')[0]
bold = glob.glob('node_modules/@fontsource/fira-code/files/fira-code-latin-700-normal.woff2')[0]
open(sys.argv[1], 'w').write(face(reg, 400) + face(bold, 700))
EOF

cat > "$WORK/puppeteer.json" <<'EOF'
{ "executablePath": "/usr/bin/chromium", "args": ["--no-sandbox"] }
EOF

XDG_DATA_HOME="$WORK/xdg" pnpm dlx @mermaid-js/mermaid-cli \
  -p "$WORK/puppeteer.json" -C "$WORK/fira.css" -i "$SRC" -o "$OUT" -b '#FBF8F4'

echo "rendered $OUT"
