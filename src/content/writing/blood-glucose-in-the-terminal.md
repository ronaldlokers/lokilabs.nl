---
title: "blood glucose in the terminal"
description: "I have diabetes and I live in a terminal, so I built a TUI for my CGM data."
pubDate: 2026-07-18
tags: ["rust", "diabetes", "cli"]
---

I have diabetes. I wear a continuous glucose monitor, and its readings land
in [Nightscout](https://nightscout.github.io/) — the open-source,
self-hosted CGM platform that the diabetes community built years before
"own your data" was a slogan.

I also spend my whole day in a terminal. Alt-tabbing to a phone app to
check a number felt wrong. So:
[sugarrush](/projects/sugarrush/) — a terminal UI for Nightscout data,
written in Rust with [Ratatui](https://ratatui.rs/).

## Why a TUI

A glucose reading is one number, a trend arrow, and a bit of history.
That's not an app; that's a status line. The terminal is where I already
live, and a TUI has exactly the right properties:

- **Glanceable.** Current value, trend, and a sparkline of the last hours,
  in a pane that's always one keystroke away.
- **Calm.** No push notifications, no login screens, no loading spinners.
  It's the same data my phone shows, minus the ceremony.
- **Mine.** It talks to my Nightscout instance. No vendor cloud in the
  loop deciding what I'm allowed to see.

## Why Rust — and who wrote it

Full honesty: I didn't write the Rust —
[Claude Code](/writing/building-with-claude-code/) did. I picked the
language out of interest: a TUI should start instantly and sip resources,
and Rust + Ratatui is the obvious modern stack for that. My job was the
product side — what to show, what to skip, does the trend arrow feel
right — plus reviewing code in a language I don't write myself. I'm not
a Rust developer. I am the guy who depends on this thing before lunch,
which turns out to be a very motivating QA role.

## The bigger point

Diabetes is a data problem you carry in your body. The community understood
that early — Nightscout exists because patients refused to wait for
vendors. Building my own window into my own data is the same instinct that
runs the rest of this site: self-host it, script it, own it.

Also, let's be honest: watching your glucose curve flatten out in a crisp
little terminal sparkline is deeply satisfying. Different kind of
observability stack.
