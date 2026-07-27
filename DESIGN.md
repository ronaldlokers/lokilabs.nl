---
name: lokilabs.nl
description: A warm paper world lit by violet CRT glow, with terminal windows as physical objects on it.
colors:
  orange: "#E9622E"
  orange-hover: "#FF7A3D"
  orange-light: "#F67D51"
  orange-line: "#C24A17"
  badge-border: "#FF8A50"
  badge-text: "#FFB98F"
  violet: "#7541B8"
  violet-lift: "#6B3AAE"
  ghost-border: "#7A52B8"
  purple: "#562C8B"
  cta-ink: "#2A1650"
  taskbar-deep: "#231145"
  lilac: "#D1B0FF"
  nav-muted: "#C9B8E8"
  lav: "#E2D5F6"
  lav-mut: "#BBA0E6"
  lav-dim: "#9B7FD0"
  tint: "#EFE7F8"
  paper: "#FBF8F4"
  card-face: "#FFFFFF"
  card-hover: "#F4EEFB"
  surface: "#EFEBE4"
  chrome: "#E0D8CC"
  chrome-line: "#DAD2C6"
  chrome-txt: "#8A8178"
  ink: "#231E1B"
  ink-soft: "#3A342F"
  muted: "#76706C"
  faint: "#A69C90"
  line: "#DCD6D1"
  line-soft: "#E7E1D9"
  footer-mail: "#9A938C"
  dot-idle: "#B7AE9E"
  badge-bg: "#FBE4D8"
  glyph-close: "#5A1500"
  glyph-max: "#4A4235"
  ok: "#1F7A4D"
  ok-bg: "#DFF0E5"
  ok-link: "#2E9E63"
typography:
  display:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "clamp(38px, 8.4vw, 112px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "clamp(30px, 4vw, 46px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-2px"
  title:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-1px"
  title-sm:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  doc-headline:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-1px"
  doc-subhead:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.5px"
  wordmark:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.5px"
  body:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  prose:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  body-sm:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "normal"
  body-dense:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "normal"
  label:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "3px"
  micro:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "1px"
rounded:
  xs: "4px"
  sm: "5px"
  chip: "7px"
  md: "8px"
  card: "10px"
  lg: "14px"
  pill: "20px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "22px"
  xl: "34px"
  section: "110px"
  gutter: "clamp(20px, 5vw, 40px)"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.purple}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    typography: "{typography.micro}"
  button-primary-hover:
    backgroundColor: "#FF7A3D"
    textColor: "{colors.purple}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.lav}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost-hover:
    textColor: "{colors.paper}"
  nav-cta:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.purple}"
    rounded: "{rounded.md}"
    padding: "7px 16px"
  open-badge:
    backgroundColor: "rgba(40, 15, 76, 0.5)"
    textColor: "#FFB98F"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  open-badge-hover:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.cta-ink}"
  card-project:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "22px 22px 24px"
  card-project-hover:
    backgroundColor: "#F4EEFB"
  badge-status:
    backgroundColor: "{colors.badge-bg}"
    textColor: "{colors.orange-line}"
    rounded: "{rounded.sm}"
    padding: "3px 9px"
    typography: "{typography.micro}"
  badge-status-production:
    backgroundColor: "{colors.ok-bg}"
    textColor: "{colors.ok}"
  tag-chip:
    backgroundColor: "transparent"
    textColor: "{colors.violet}"
    rounded: "{rounded.sm}"
    padding: "2px 9px"
  skill-chip:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "5px 11px"
  terminal-window:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.lg}"
  post-row:
    backgroundColor: "transparent"
    textColor: "{colors.purple}"
    rounded: "{rounded.card}"
    padding: "19px 14px"
  post-row-hover:
    backgroundColor: "{colors.tint}"
---

# Design System: lokilabs.nl

## Overview

**Creative North Star: "The Paper Terminal"**

Every terminal aesthetic starts from the same premise — black screen, glowing
text — and this system inverts it. The world is warm paper stock (`#FBF8F4`),
the kind of off-white that reads as a printed page rather than a UI surface.
Deep Violet is not a background; it is a *light source*. It floods the hero and
the contact footer as a radial glow, it tints the nav through a blur, it is the
color of every shadow. The terminal itself appears as a physical object placed
on the paper: a bordered window with a chrome bar and three colored dots, sitting
in its own violet-tinted pool of light. Text is ink on paper; the machine is the
thing casting light onto it.

The density is tight and technical — Fira Code at 12.5px through 15px, 1.7–1.8
line-height, hairline dividers, small uppercase labels with wide tracking — but
the temperature is warm throughout. Nothing here is cold gray. Neutrals are
built on a beige-brown axis (`#231E1B` ink, `#EFEBE4` surface, `#DCD6D1` lines),
so the system reads as *workshop*, not *console*. Ember Orange does one job and
does it constantly: it marks whatever is alive. Cursors blink orange, prompt
sigils are orange, dates are orange, arrows are orange, every CTA is a solid
orange block, and the commit ticker is a full-bleed orange band. When something
in this interface is orange, it is signaling.

The interaction language is a desktop OS, played straight rather than winked at.
Documents open in a window that boots with a fake log, can be minimized to a
taskbar at the bottom of the screen, maximized, and closed by traffic lights.
This is the one place the system spends real complexity, and it does so because
the product's whole argument is craft. It is explicitly not a dark-mode hacker
terminal, and explicitly not a corporate SaaS portfolio: no phosphor green on
black, no glassmorphism on a mesh gradient, no sans-serif body font anywhere.

**Key Characteristics:**

- Warm paper world, violet light source, ember signal — three roles, no fourth.
- One typeface (Fira Code) for absolutely everything, including 112px display.
- Terminal windows as physical objects: chrome bar, traffic lights, boot log.
- Flat surfaces everywhere; shadow is reserved for windows and is violet, never gray.
- Headings track tight and negative; labels track wide and uppercase.
- Real machine motion — a blinking cursor, a marquee ticker, a pulsing status dot.

## Colors

A warm three-role palette: paper to read on, violet to light it, ember to signal.

### Primary

- **Ember Orange** (`#E9622E`): the live signal. Prompt sigils (`$`, `→`),
  the blinking hero cursor, post dates, hover arrows, every primary button, the
  full-bleed commit ticker, the left rule on the about timeline, and the `close`
  traffic light. Never a reading surface.
- **Ember Light** (`#F67D51`): the on-violet substitute. Raw Ember Orange
  measures 2.94:1 against Deep Violet and fails even the 3:1 large-text floor,
  so anything orange that sits *on* purple uses this instead — the wordmark
  prompt, the second hero headline line, footer sigils.
- **Ember Line** (`#C24A17`): the darkened edge — ticker borders, badge text on
  the pale badge ground, CV button hover.
- **Ember Hover** (`#FF7A3D`): the brightened hover state of every primary
  button. Ember only ever gets *lighter* on hover, never darker.
- **Badge Border** (`#FF8A50`) and **Badge Text** (`#FFB98F`): the two lifted
  ember tints that make the "open to new roles" pill legible on deep violet.

### Secondary

- **Deep Violet** (`#562C8B`): the light source and the voice of headings. The
  hero and contact radial gradients, the blurred nav at 85% alpha, every section
  heading, every card title, `theme-color` for the iOS status bar.
- **Signal Violet** (`#7541B8`): the interactive violet — body links, the
  `minimize` traffic light, skill chips, the panel focus ring, timeline years.
- **Deep Ink Violet** (`#2A1650`): the taskbar gradient top and text on orange
  bars — the darkest violet in the system. **Taskbar Deep** (`#231145`) is its
  gradient partner at the bottom of that bar.
- **Violet Lift** (`#6B3AAE`): the bright stop of every radial gradient — the
  point the light appears to come from in the hero (75% 20%) and the contact
  footer (25% 90%). It never appears as a flat fill.
- **Ghost Border** (`#7A52B8`): the 1px outline of a ghost button on violet
  ground.

### Tertiary

- **Lilac** (`#D1B0FF`), **Nav Muted** (`#C9B8E8`), **Lavender** (`#E2D5F6`),
  **Lavender Muted** (`#BBA0E6`), **Lavender Dim** (`#9B7FD0`): the on-violet
  text ramp, brightest to dimmest. Lavender is body copy on purple, Nav Muted is
  navigation and dimmed prompt paths, Lilac is the username in a prompt line.
  Lavender Dim is decoration only — it measures 2.98:1 on purple and must never
  carry text there.
- **Violet Tint** (`#EFE7F8`): the palest violet, used as a *hover ground* on
  paper — post rows, the portrait panel, tag pills, the "daily use" badge.

### Neutral

- **Paper** (`#FBF8F4`): the page. The only background the document itself uses.
- **Card Face** (`#FFFFFF`) and **Card Hover** (`#F4EEFB`): the project card at
  rest and under violet light. Card Face is the only pure white in the system,
  and exists so a card reads as a sheet lying *on* the paper.
- **Surface** (`#EFEBE4`): the terminal interior — window bodies, the overlay
  panel, inline code grounds.
- **Chrome** (`#E0D8CC`) / **Chrome Line** (`#DAD2C6`) / **Chrome Text**
  (`#8A8178`): the window title bar system — bar fill, its border, its label.
- **Ink** (`#231E1B`): body text and the two dark blocks in the system (the
  footer band, code blocks). A warm near-black, never `#000`.
- **Ink Soft** (`#3A342F`): prose and terminal body copy.
- **Muted** (`#76706C`): secondary copy, card blurbs, uppercase section labels.
- **Faint** (`#A69C90`): the quietest text — command hints beside section heads,
  end-of-document notes.
- **Line** (`#DCD6D1`) / **Line Soft** (`#E7E1D9`): hairline dividers, list
  separators, ghost-button borders.
- **Idle Dot** (`#B7AE9E`): the third traffic light — the one that isn't lit.
- **Glyph Close** (`#5A1500`) and **Glyph Max** (`#4A4235`): the `×` and `+`
  drawn inside the traffic lights, each a darkened version of its own dot so the
  glyph reads as engraved rather than printed.
- **Footer Mail** (`#9A938C`): the email address in the document-page footer band
  — the only neutral tuned specifically for the Ink ground.

### Status

- **Ready Green** (`#1F7A4D` on `#DFF0E5`): `production` / `live` project
  badges. **Live Link Green** (`#2E9E63`): the "live" link on a project.
  Green is status only; it never becomes an accent.

### Named Rules

**The Ember Rule.** Ember Orange means *this is alive or this is clickable*. It
is never decoration, never a background for reading text, and never used for two
different meanings on the same screen. Its constancy is what makes the blinking
cursor legible as a signal rather than an ornament.

**The Inverted Terminal Rule.** Dark is never the background of a page. Deep
Violet behaves as light — gradients, glows, blurs, tinted shadows — and Ink
appears only as text or as a deliberate solid band (footer, code block). A
full-bleed dark page would break the metaphor at the root.

**The Purple Contrast Rule.** Only Paper, Lilac, Nav Muted, Lavender, and Ember
Light are legible on Deep Violet. Raw Ember Orange (2.94:1) and Lavender Dim
(2.98:1) are decoration-only there and are already annotated as such in the
source. Test any new on-purple color before shipping it.

**The Ember Fill Rule.** The pairing runs both ways, and the reverse direction
is the one that shipped broken: text *on* an Ember Orange fill is **Deep Ink
Violet** (`#2A1650`, 4.70:1), never Deep Violet (2.93:1) and never Paper
(3.17:1). This governs every primary button — the nav CV CTA, the hero CTA, the
CV actions, the footer mail button. Paper on Ember survives only where the type
is large enough for the 3:1 floor, which today means the commit ticker and
nothing else.

## Typography

**Display Font:** Fira Code (fallback `ui-monospace`, `SFMono-Regular`, `Menlo`)
**Body Font:** Fira Code — the same face
**Label/Mono Font:** Fira Code — the same face

**Character:** One monospace voice for the entire system, from a 112px hero
headline down to a 10px status badge. At display sizes Fira Code stops reading
as "code font" and becomes a wide, engineered, slightly mechanical display face;
tightening tracking hard (`-0.045em`) is what makes that work. At small sizes it
does exactly what a terminal does. The absence of a second family is the design
decision, not a shortcut.

### Hierarchy

- **Display** (700, `clamp(38px, 8.4vw, 112px)`, line-height 1.0, tracking
  `-0.045em`): hero and contact headlines only. Two lines maximum, second line in
  Ember Light.
- **Headline** (700, `clamp(30px, 4vw, 46px)`, tracking `-2px`): section heads
  (`about/`, `writing/`, `projects/`) in Deep Violet with an Ember Orange
  trailing slash; overlay document titles at `-1.5px`, project titles at `-2px`
  and up to 54px.
- **Title** (700, 21px, tracking `-1px`): project card names. Post row titles are
  the softer sibling (600, 16px).
- **Body** (400, 15px, line-height 1.6): base page copy. Dense variant is 12.5px
  at line-height 1.8 for terminal interiors and card blurbs; prose is 14px at
  1.75. Reading columns cap at 880px on document pages, 520px for the hero
  subhead.
- **Label** (600, 10.5–11px, tracking 1.5–3px, uppercase): section sublabels,
  the `contact` eyebrow, in-terminal group headings.
- **Micro** (600, 10–10.5px, tracking 1px, uppercase): status badges.

The document pages (`.wrap` surfaces served without the living terminal) run a
quieter parallel ramp: **Wordmark** (700, 17px, `-0.5px`) in the solid violet
header, **Doc Headline** (700, 32px, `-1px`) for page titles, **Doc Subhead**
(700, 18px, `-0.5px`) for prose `h2`, **Prose** (400, 14px/1.75) for body, and
**Body Small** (400, 13.5px/1.8) for overlay descriptions and CV summaries.
These are steps of the same system at document scale, not a second ramp.

### Named Rules

**The One Face Rule.** Fira Code, everywhere, forever. There is no secondary
family and no sans-serif fallback in the stack. Hierarchy comes from size,
weight, tracking, and color — never from a second typeface.

**The Tracking Inversion Rule.** Type tracks *tighter* as it gets bigger
(`-0.045em` at display, `-2px` at section heads, `-1px` at card titles) and
*wider* as it gets smaller (`+1px` at badges, `+1.5px` at group headings, `+3px`
at eyebrows). Default `normal` tracking belongs only to body copy.

**The Prompt Line Rule.** Sections and headings are introduced by a real shell
prompt — `ronald → ~/lokilabs $ whoami` — with the user in Violet or Lilac, the
arrow and `$` in Ember, the path dimmed, and the command in the brightest
available text color. It is the system's signature, and it must parse as a
plausible command, never as decorative gibberish.

## Layout

Two container widths, deliberately different. The living-terminal surfaces
(hero, sections, contact, taskbar) cap at **1200px**; the document pages that
predate them (`.wrap`) cap at **880px** for reading. Horizontal gutter is
`clamp(20px, 5vw, 40px)` on the wide surfaces and a flat 28px (18px under 640px)
on the narrow ones.

Vertical rhythm is generous and section-scale: 110px bottom padding per section,
100px top, 90–120px variants where a section needs breathing room, and 40px
between a section head and its content (54px for projects). Inside components the
rhythm compresses hard — 22px card padding, 26–30px terminal padding, 6–14px
between list items. The contrast between section-scale air and component-scale
density is what keeps a mono-only page from reading as a wall of text.

The hero is `min-height: 100vh` and vertically centered. Project cards use
`repeat(auto-fit, minmax(300px, 1fr))` with a 22px gap — three columns at
1440px, two at laptop widths, one below ~660px, no explicit breakpoint. Post rows are a three-column grid
(`110px 1fr auto`: date, title, arrow) that compresses to `78px 1fr auto` on
mobile. Sections carry `scroll-margin-top: 84px` to clear the fixed nav.

Breakpoints: **640px** for the document-page chrome, **680px** for the
living-terminal surfaces. Safe-area insets (`env(safe-area-inset-top/bottom)`)
are respected on the nav, the header, and the overlay panel for iOS standalone
mode.

### Named Rules

**The Two Caps Rule.** 1200px for living-terminal surfaces, 880px for reading
documents. A new surface picks one and commits; splitting the difference makes
the contact footer sit visibly out of line with the sections above it — a bug
this system has already fixed once.

## Elevation & Depth

Flat surfaces, lit windows. Separation is carried by tone (Paper → Surface →
Chrome) and hairline borders, not by shadow. Shadow appears in exactly three
places, and in each of them the element is a *window* — a thing floating above
the paper rather than printed on it. Every shadow is violet-tinted with a large
blur and a strongly negative spread, which reads as a soft pool of light rather
than a drop shadow. There is no gray shadow anywhere in the system.

### Shadow Vocabulary

- **Window lift** (`box-shadow: 0 18px 40px -24px rgba(86, 44, 139, 0.35)`): the
  about terminal resting on the paper.
- **Panel float** (`box-shadow: 0 44px 100px -34px rgba(40, 15, 76, 0.65)`): the
  detail overlay, lifted much further and darker because it sits over a
  violet-scrimmed page.
- **Taskbar rise** (`box-shadow: 0 -12px 30px -18px rgba(0, 0, 0, 0.6)`): an
  upward shadow under the minimized-window bar; the one place the tint is
  neutral, because the bar is already near-black violet.

Depth is also built without shadow: the fixed nav uses `backdrop-filter:
blur(14px)` over 85% Deep Violet, and the overlay scrim animates from
transparent to `rgba(35, 18, 62, 0.55)` with a 4px blur.

### Named Rules

**The Window Rule.** If it does not have a chrome bar with traffic lights, it
does not get a shadow. Cards, rows, badges, and buttons are flat at rest and stay
flat on hover; they respond with background and border changes instead.

## Shapes

Rounding is soft but never pill-shaped, with one exception. The scale runs 4px
(inline code), 5px (badges, chips, tag pills), 7px (taskbar chips), 8px (buttons
and the nav CTA), 10px (post rows, code blocks, images), 14px (terminal windows,
project cards, the overlay panel), 20px (the "open to new roles" status badge —
the only true pill), and 50% (traffic lights and status dots).

Borders are hairline and warm: 1px `#DCD6D1`/`#E7E1D9` on paper, 1px `#DAD2C6`
around terminal chrome, `#E2D9CC` on project cards, and translucent white
(`rgba(255,255,255,0.08–0.16)`) on violet ground. The recurring silhouette is the
**terminal window**: a 14px-radius rounded rectangle with a flat-topped chrome
bar (44px tall on the about terminal, 38px on cards) carrying three 10–11px dots
in Ember / Signal Violet / Idle, followed by a small Chrome Text filename.
Accents also appear as *rules* rather than fills — a 2px Ember left border on the
timeline, a 3px Ember left border on taskbar chips, a 3px Ember left border on
blockquotes.

On mobile the overlay panel drops its radius to 0 and goes edge-to-edge; the
window metaphor gives way to full-screen because a 94vw window on a phone is just
a page with wasted margins.

### Named Rules

**The Traffic Light Rule.** Every terminal object opens with the same three
dots, in the same order, in the same colors: Ember (close), Signal Violet
(minimize), Idle (inert). On the interactive overlay they are real buttons whose
glyphs (`×` `−` `+`) fade in on hover or focus; everywhere else they are pure
decoration and are `aria-hidden`.

## Components

### Buttons

- **Shape:** softly rounded (8px), never pill, never square.
- **Primary:** solid Ember Orange ground with Deep Ink Violet text (see The
  Ember Fill Rule), 700 weight, 13px, `12px 24px` padding. On violet grounds
  this pairing is the CTA; the same button appears in the nav at `7px 16px` and
  in the contact footer at `15px 26px` for the mail action.
- **Hover / Focus:** background brightens to `#FF7A3D`, 0.15s ease. Text color
  holds.
- **Active:** `transform: scale(0.96)` — a real press. Every button, chip, card,
  and row in this system moves on `:active`; nothing is inert.
- **Ghost:** transparent with a 1px `#7A52B8` border and Lavender text, 600
  weight. Hover lifts the border to Lavender Muted and the text to Paper.
- **Alt (on paper):** no fill, 1px Line Soft border, Deep Violet text; hover
  shifts border and text to Signal Violet.

### Chips

- **Status badge:** uppercase micro type (10px, 700-ish 600 weight, 1px
  tracking), 5px radius, `3px 9px` padding. Default is Ember Line on a pale
  `#FBE4D8` ground; `production`/`live` switch to Ready Green on `#DFF0E5`;
  `daily use` switches to Signal Violet on Violet Tint. Any unrecognized string
  silently falls back to the orange default.
- **Tag pill:** the deliberate counterweight — outlined (1px Chrome Line), no
  fill, lowercase, Signal Violet text. Solid-and-uppercase means *status*;
  outlined-and-lowercase means *category*. The distinction is load-bearing where
  both appear together.
- **Skill chip:** solid Signal Violet with Paper text, 5px radius — used only in
  the CV where chips are content, not metadata.
- **Status badge (on violet):** the "open to new roles" pill — 20px radius, 1px
  `#FF8A50` border, `rgba(40,15,76,0.5)` ground, `#FFB98F` text, led by an
  8px Ember dot pulsing on a 2s ease-in-out loop. Hover fills it solid Ember.

### Cards / Containers

- **Corner Style:** 14px, matching the terminal window.
- **Background:** pure white (`#FFFFFF`) — the one place in the system whiter than
  Paper, which makes cards read as sheets *on* the page.
- **Hover:** ground shifts to `#F4EEFB` and the border to `#C9B4E8`, 0.25s ease —
  the violet light falling on the card. No lift, no shadow.
- **Shadow Strategy:** none. See The Window Rule.
- **Border:** 1px `#E2D9CC`.
- **Internal Padding:** `22px 22px 24px`, with an 11px gap stack inside.
- **Structure:** a card is a terminal — 38px chrome bar with traffic lights and a
  filename, then the body.

### Navigation

Fixed, full-width, `rgba(86,44,139,0.85)` with a 14px backdrop blur and a
`rgba(255,255,255,0.08)` bottom hairline. Brand at 15px/700 with `-0.5px`
tracking, Paper with an Ember `$`. Links at 12.5px/500 in Lavender, going Paper
on hover, 26px apart (13px and 11px under 680px). The CV link is not a link but
the primary CTA — the only orange element in the bar, and the highest-value
action on the site.

Document pages carry a second, older chrome: a solid Deep Violet header bar at
`22px 28px`, wordmark left, links right in Nav Muted, and an Ink footer band.

### Inputs / Fields

None. This system has no form controls — contact is a `mailto:` link. Any future
input should take the terminal treatment: Surface ground, 1px Chrome Line border,
5px radius, and a Signal Violet focus ring matching the panel's
`outline: 2px solid var(--violet); outline-offset: -2px`.

### Living Terminal Overlay (signature component)

The system's defining component. Documents open in a centered window
(`min(900px, 94vw)`, `top: 5vh`, `max-height: 90vh`) over a violet scrim, with a
Chrome title bar carrying three real traffic-light buttons, a Chrome footer
strip with prev/next document navigation, and a boot log that types out on first
open before revealing content with a 55ms-staggered fade-up. `maximize` expands
it to an 18px inset; `minimize` sends it to a fixed bottom taskbar as a chip with
a 3px Ember left border. Entrance is `opacity 0.35s ease` plus
`transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)` from `scale(0.95)`. On mobile it
becomes full-screen with no radius. Under `prefers-reduced-motion: reduce`, all
of it — cursor blink, ticker marquee, pulse dots, panel transitions — stops.

### Commit Ticker (signature component)

A full-bleed Ember Orange band between hero and content, bordered top and bottom
in Ember Line, scrolling real recent GitHub commits at `34s linear infinite` in
13px/600 Paper text with 0.5px tracking. Pauses on hover. It is the system's
proof-of-life device: real data, always moving.

### Hero Glyph Field (signature component)

A canvas behind the hero drawing a 28px grid of terminal glyphs
(`$ > _ / # ~ { } | = + * · → ✓`) in 13px Fira Code, each cell waving on its own
phase, ~6% of them Ember, reacting to the pointer. It is the violet light made
visible — texture, never content, and never dense enough to compete with the
headline.

## Do's and Don'ts

### Do:

- **Do** use Ember Orange for exactly one meaning per screen: this is live, or
  this is the action.
- **Do** put a real, parseable shell prompt above a section or hero headline
  (`ronald → ~/lokilabs $ whoami`), with the `$` and `→` in Ember.
- **Do** give every terminal object the full chrome bar — three dots in Ember /
  Signal Violet / Idle, plus a lowercase filename in Chrome Text.
- **Do** tighten tracking as type grows (`-0.045em` display, `-2px` heads) and
  open it as type shrinks (`+1px` badges, `+3px` eyebrows).
- **Do** respond to `:active` with `scale(0.96)` on buttons and `scale(0.99)` on
  cards and rows. Physical feedback is the component philosophy.
- **Do** swap to Ember Light (`#F67D51`) for any orange text placed on Deep
  Violet; raw Ember fails contrast there at 2.94:1.
- **Do** kill every animation under `prefers-reduced-motion: reduce` — cursor,
  marquee, pulse, panel transitions, reveal staggers.
- **Do** keep hover on paper surfaces in the violet family (Violet Tint ground,
  violet border) — the light falling on the page.

### Don't:

- **Don't** build a dark page. Deep Violet is a light source and Ink is text; a
  full dark-mode surface breaks The Inverted Terminal Rule.
- **Don't** introduce phosphor green, matrix rain, or any dark-mode hacker
  terminal signifier. This is a confirmed anti-reference.
- **Don't** introduce glassmorphism cards on a mesh gradient, stock photography,
  or a sans-serif body font. Corporate-SaaS-portfolio is a confirmed
  anti-reference.
- **Don't** add a second typeface. Fira Code carries every role.
- **Don't** put a shadow on anything without a chrome bar, and never use a gray
  shadow — the palette is violet-tinted only.
- **Don't** use Lavender Dim (`#9B7FD0`) for text on Deep Violet; it measures
  2.98:1 and is decoration-only.
- **Don't** use pure black, pure white as a page ground, or a cool gray. The
  neutral axis is warm beige-brown; the only `#FFFFFF` in the system is the
  project card face.
- **Don't** mix the badge treatments: solid + uppercase is status, outlined +
  lowercase is category. Reversing them destroys the distinction where they sit
  side by side.
- **Don't** give an element both a fill and a shadow to signal importance.
  Importance here is Ember, tone, and motion — never elevation.
