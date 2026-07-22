---
name: prod-smoke
description: Verify production lokilabs.nl after a deploy or when something "doesn't work" in production. Use after every merge that changes routes/assets, whenever the user reports the live site broken, and for checking headers/caching/OG/sitemap on production. Plain curl to lokilabs.nl FAILS on this machine — this skill has the required workaround.
---

# prod-smoke — checking production from this machine

Ronald's LAN DNS rewrites `lokilabs.nl` to `10.0.40.7` (internal box,
refuses :443), so a naive `curl https://lokilabs.nl` fails or hits the wrong
host. Always resolve via public DNS first:

```bash
IP=$(curl -s 'https://1.1.1.1/dns-query?name=lokilabs.nl&type=A' \
  -H 'accept: application/dns-json' | grep -o '"data":"[0-9.]*"' | head -1 | cut -d'"' -f4)
```

Then pin every request: `curl --resolve lokilabs.nl:443:$IP ...`

## Standard sweep

```bash
for p in "" about/ projects/ writing/ cv/ rss.xml sitemap-index.xml robots.txt og/home.png nonexistent; do
  echo "$p: $(curl -so /dev/null -w '%{http_code}' --resolve lokilabs.nl:443:$IP https://lokilabs.nl/$p)"
done
```

Expected: all 200 except `nonexistent` → 404 (custom page).

## Caching check

Hashed assets must be immutable (set via `public/_headers`):

```bash
curl -sI --resolve lokilabs.nl:443:$IP https://lokilabs.nl/_astro/<any-asset> | grep -i cache-control
# expect: public, max-age=31536000, immutable
```

`cf-cache-status: HIT` on repeat = edge cache working.

## Notes

- Deploys trigger on merge to main; give Workers Builds a minute or two
  before concluding a change "didn't deploy".
- Crawler behavior: repeat a request with
  `-A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"`
  when debugging SEO/GSC fetch reports.
- The browser MAY reach production via IPv6 even when curl can't — don't
  treat a working browser as proof curl paths are fine, or vice versa.
