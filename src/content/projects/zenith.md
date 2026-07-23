---
title: "Zenith"
description: "A job-hunt tracker that treats your search like a pipeline."
tech: ["typescript", "cloudflare"]
repo: "https://github.com/ronaldlokers/Zenith"
order: 20
featured: true
screenshot: /assets/projects/zenith.png
badge: "beta"
---

## The result

A complete SaaS — kanban pipeline, sourced-listings inbox, CV builder,
analytics — running entirely on Cloudflare's free tier. Live at
[zenith.lokilabs.nl](https://zenith.lokilabs.nl), invite-only.

## The problem

A job search *is* a pipeline: applications advance through stages, stall,
convert, or ghost. Spreadsheets don't show momentum, and the tracker SaaS
options want your data on their terms. I was job hunting anyway — so the
tracker became the project.

## The approach

- **Pipeline as kanban**: five stages (interested → applied → screening →
  interview → offer), drag-to-restage, filters, saved views, archive
- **Sourced-listings inbox**: pulls fresh roles every 6 hours from Adzuna
  and any Greenhouse/Ashby boards you follow, filtered by role keywords —
  swipe to triage
- **Analytics that answer questions**: conversion funnel, response rate,
  median time-in-stage, ghost rate — where do deals stall?
- **CV builder** with multi-language support and PDF export
- **Privacy by default**: no analytics, no tracking, invite-only accounts

## The constraints

The whole thing is designed inside Cloudflare's free-tier quotas — compute,
storage, and scheduled jobs all budgeted to cost exactly €0. Free-tier
architecture is a real discipline: every feature gets designed twice, once
for the product and once for the quota.

Built with Claude Code.
