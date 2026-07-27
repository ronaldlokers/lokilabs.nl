---
target: homepage
total_score: 31
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 3
timestamp: 2026-07-27T14-37-55Z
slug: src-components-sitehome-astro
---
Method: dual-agent (A: design review · B: detector + browser evidence), isolated and parallel. Both agents shared a browser context; A's navigation perturbed B's tab mid-run. B detected the drift and re-measured against a verified URL; reported numbers are from the clean pass.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Boot log, taskbar count, focus ring strong; ticker and giscus have no placeholder — empty orange band reads as broken, not loading |
| 2 | Match System / Real World | 4 | Terminal metaphor backed by real kubectl/flux output, real dates, real repos |
| 3 | User Control and Freedom | 4 | Escape closes, traffic lights work, focus returns to triggering card, URL reverts |
| 4 | Consistency and Standards | 2 | Three measured contrast failures incl. every primary CTA at 2.9:1; skip link doesn't move focus; writing/ and projects/ ship 0px top padding against a documented 100px |
| 5 | Error Prevention | 3 | No confirmation after mailto/print — normal for web, but this is the funnel being protected |
| 6 | Recognition Rather Than Recall | 4 | Every section self-labels in-voice |
| 7 | Flexibility and Efficiency | 3 | Foot-nav prev/next is a real accelerator; no way to move between items without opening one first |
| 8 | Aesthetic and Minimalist Design | 4 | One typeface, three-role palette, restrained at production scale |
| 9 | Error Recovery | 4 | 404 doc on-brand with two real recovery links |
| 10 | Help and Documentation | n/a | Persuade surface with no help system; none missed |
| **Total** | | **31/36** | **Good (86%)** |

Assessment A scored Consistency 3; lowered to 2 in synthesis because A reviewed without detector access and did not measure contrast.

## Design Specificity Verdict

**LLM assessment:** High specificity, genuinely authored. Cannot be reskinned onto another portfolio without rewriting load-bearing parts — homelab card embeds real captured kubectl output, badge styling keys off exact status strings, prompt copy written per-section. The genre is well-trodden but the execution inverts its own cliches (paper not black, violet as light source, no phosphor green), matching DESIGN.md's anti-references.

**Deterministic scan:** CLI detector on SiteHome.astro, index.astro, Base.astro, src/components/detail/ — exit 0, zero findings. Browser-injected detector found 33 anti-patterns against rendered DOM; 8 rule classes adjudicated as false positives (purple gradient, cream page, single font, pulsing dot, marquee, thin-border-wide-shadow, undersized micro text) — each a documented named choice in DESIGN.md.

Three findings survived as real:
- #562C8B on #E9622E at 2.9:1 — Deep Violet text on Ember button fill (button-primary: nav CV button, hero CTA). DESIGN.md's Purple Contrast Rule covers orange-text-on-violet, never the button's own fill.
- #F67D51 on #6B3AAE at 2.8:1 — Ember Light against the gradient's bright hotspot rather than the flat base.
- heading-rhythm — .lk-section sets padding 0 … 110px; only .about and .doc add padding-top 100px, so writing/ and projects/ ship 0px top padding.

**Visual overlays:** injection succeeded during Assessment B; live server and preview server both stopped before reporting, so no overlay is currently visible.

## Overall Impression

Well-built and genuinely specific; craft is real (overlay focus management is correct in a way most hand-rolled modals are not). The problem is not quality — it is that every conversion moment is designed as if it were neutral information. Production counters read cv=22, mailto=1, github=0, linkedin=0. The design never says "email this person" louder than it says anything else.

## What's Working

1. The homelab card's embedded terminal screenshot — real kubectl get nodes / flux get kustomizations output inside a production badge. The most effective artifact on the page for the recruiter's actual doubt: evidence, not a claim.
2. Overlay focus management is correct. Verified by direct interaction: focus enters the panel, Escape returns it to the exact card that opened it, URL reverts.
3. The prompt-line convention does real IA work — every section announces itself in-voice, solving discoverability and personality with one device.

## Priority Issues

**[P0] The contact footer gives four links identical weight against a 22:1:0:0 engagement reality.**
mail, open github, open linkedin, open cv all render as the same 15px lavender $-prefixed treatment. Nothing indicates which the site wants clicked. Last screen before the visitor leaves permanently; where mailto=1 is made or lost.
Fix: give the mail link solid-button treatment; demote github/linkedin to a quieter secondary row.
Suggested command: /impeccable layout

**[P1] Every primary CTA fails contrast at 2.9:1.**
Deep Violet on Ember at 13px/700 needs 4.5:1. Affects the nav CV button and hero CTA — the two highest-value elements, and the one contrast pair DESIGN.md never covered.
Fix: darken button text toward --cta-ink (#2A1650) or reconsider the fill; verify, then add the rule to DESIGN.md.
Suggested command: /impeccable audit

**[P1] The hero demotes the CV to a ghost button.**
about me → is solid Ember; open cv → is ghost. DESIGN.md calls the CV the highest-value action on the site and the nav agrees. The hero inverts it where a first-timer picks where to click.
Fix: swap the two treatments.
Suggested command: /impeccable layout

**[P1] The CV overlay ends on a 2005 freelance gig and then stops.**
Last content before the decision is "Owner / Front-end developer @ h2o media, 2005 → 2015" — no repeated CTA, no signpost. Peak-end violation at the moment that produces the one tracked metric.
Fix: repeat the get-in-touch CTA after the job list.
Suggested command: /impeccable onboard

**[P2] Two factual inconsistencies a platform recruiter is primed to catch.**
history.ts says the pivot chapter is "dec 2024 → now"; About prose says "Since mid-2025" and the timeline says "2025–now". Separately history.ts:73 exports an education array — including 2025 → now DevOps @ Kubecraft — that nothing imports. Both verified directly.
Fix: reconcile the date; render education in the CV overlay.
Suggested command: /impeccable clarify

## Persona Red Flags

**Jordan (confused first-timer):** ghost-styled open cv → reads as the lesser option. Cold giscus block (0 comments, 0 reactions) reads as "nobody cares about this site." Taskbar-chip pattern assumes desktop window-manager literacy.

**Casey (distracted mobile user):** ~2.5–3s fake boot log replays on every open with no skip affordance. Closing the full-screen mobile CV requires hitting a 13px traffic light, no swipe-to-dismiss. Nav CV CTA measures 33.2 × 29.6px, under the 44px floor.

**Platform/DevOps recruiter (derived from PRODUCT.md):** hits the date mismatch between About and CV. Reads the whole CV and the last thing seen is a 20-year-old side gig. Never sees the Kubecraft DevOps course that would answer "is the homelab training or hobby?"

## Minor Observations

- Ticker renders as a bare empty orange band when /api/ticker has not resolved; verify a cold KV cache does not do this in production.
- DESIGN.md documents the project grid as two columns at desktop; auto-fit minmax(300px, 1fr) renders three at 1440px. Documentation drift introduced in the document pass.
- Skip link scrolls to #main but does not move focus; #main has no tabindex="-1".
- About's inline "Get in touch" mailto is styled identically to the "repo" link one paragraph above.
- Console on load: 404 /api/ticker (expected in static preview) and a CORS failure to cloudflareinsights.com (localhost-only).
- Cognitive load: 2 of 8 checklist items fail (chunking — CV skill chips 7 in a row, 9 flat job entries; visual hierarchy — hero CTA inversion, flat footer). No decision point exceeds 4 visible options.

## Questions to Consider

1. If the nav and the CV agree the CV is the primary action, why is it a ghost button in the hero?
2. The footer lists github and linkedin at the same weight as mail, but they are not in the success metric and have zero clicks. Should they be there at all?
3. If 22 people open the CV and 1 mails, is it the CV's content converting them or its ending?
4. Is the boot log worth its latency on the second open in a session?
