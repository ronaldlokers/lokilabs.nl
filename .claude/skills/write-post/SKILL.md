---
name: write-post
description: Author or edit writing posts for lokilabs.nl in the house style. Use whenever the user asks for a new post, blog article, draft, or edits to anything in src/content/writing/ — including "write about X" requests that don't say the word post.
---

# write-post — house style for lokilabs.nl writing

## File + frontmatter

`src/content/writing/<kebab-slug>.md`:

```yaml
title: "lowercase title"          # site style is lowercase titles
description: "one honest sentence — appears in lists, RSS, OG"
pubDate: 2026-07-21               # ISO in source; site displays dd-mm-yyyy
tags: ["kebab", "tags"]           # reuse existing tags where true — related
                                  # posts only appear when tags overlap
```

Build validates the schema; OG card, RSS entry, sitemap, reading time are all
automatic. Verify with `mise exec -- pnpm build`.

## Voice

Terminal-nerd playful: short sentences, dry humor, technical but human.
First person. Lead with the point, not throat-clearing. A good closer earns
its place ("Different kind of observability stack."). 400–700 words is the
house length.

## Honesty rules (non-negotiable)

- Only real facts. No invented war stories, metrics, dates, or prices — if a
  number isn't verified, cut it or ask Ronald.
- AI involvement is disclosed plainly when relevant (precedent: the sugarrush
  post says Claude wrote the Rust).
- Health topic (diabetes) is fine — Ronald's call, already public — but stick
  to what he's stated; never infer details (type, treatment).

## Terminal output blocks

Shell output ALWAYS renders in house style — never a bare fence:

````
```ansi frame="terminal" title="ronald@<host> — <context>"
````

Inside, real ANSI escapes (write via python, not by hand): prompt
`ronald → host $` with violet `38;2;164;125;224` names, orange
`38;2;246;125;81` arrow/`$`, near-white `38;2;239;235;228` command; success
values green `38;2;125;201;143`; end with a trailing prompt + orange block
cursor `\x1b[48;2;246;125;81m \x1b[0m`. Reference implementation: the kubectl
block in `three-control-planes-on-raspberry-pi.md`. Plain command fences use
```` ```bash ```` (auto terminal frame); file fences take `title="path"`.
