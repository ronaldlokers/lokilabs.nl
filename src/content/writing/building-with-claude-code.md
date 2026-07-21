---
title: "building four apps with claude code"
description: "What AI-assisted building changes about side projects — and what it doesn't."
pubDate: 2026-07-19
tags: ["ai", "process"]
---

Every project on this site was built with
[Claude Code](https://claude.com/claude-code) in the loop:
a treadmill controller, a job-hunt tracker, a glucose TUI, and the site
you're reading. Four very different stacks. Some honest notes.

## What changes

**The graveyard shrinks.** Every developer has a folder of side projects
that died at 30%. The boring middle — the settings page, the error states,
the CI workflow — is where they die. That's exactly the part AI is
relentless at. Projects reach *done* now.

**Scope stops scaring me.** [WalkFit](/projects/walkfit/) speaks a Bluetooth
protocol to a physical treadmill and renders a survey-exact 400m athletics
track in 3D. Past me would have filed that under "someday". It shipped —
with CI, E2E tests, and deploys.

**Unfamiliar stacks stop being a wall.** [sugarrush](/projects/sugarrush/)
is written in Rust. I'm not a Rust developer — Claude wrote it, out of my
interest in the stack. The gap between "I don't know this language" and
"working software I trust" used to be months; now it's an evening plus
careful review.

## What doesn't change

**Taste is still the job.** The model will happily build the wrong thing
beautifully. Deciding what to build, what *not* to build, and when the
answer is "delete it" — that's still on me.

**Review is still the job.** Everything gets read. The dotfiles repo I built
by hand over years, and I extend it with Claude Code the way I'd take PRs
from a fast colleague: gratefully, but with eyebrows engaged.

**Ownership is still the job.** [Zenith](/projects/zenith/) runs on
Cloudflare's free tier. When something breaks at the platform level, no
model saves you — understanding your own architecture does.

## The uncomfortable summary

The bottleneck moved. It's no longer typing speed or stack familiarity —
it's judgment: knowing what good looks like and insisting on it. Fifteen
years of building things turns out to be excellent training for exactly
that.

The tools got faster. The standards didn't drop. That combination is the
whole game.
