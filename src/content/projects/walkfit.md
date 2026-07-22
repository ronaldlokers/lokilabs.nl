---
title: "WalkFit"
description: "Control a walking treadmill from the browser over Web Bluetooth — with a virtual 400m track."
tech: ["vue 3", "typescript", "web bluetooth", "github actions"]
repo: "https://github.com/ronaldlokers/WalkFit"
link: "https://ronaldlokers.github.io/WalkFit/"
badge: "beta"
order: 10
screenshot: /assets/projects/walkfit.png
---

## The result

A browser tab drives a physical treadmill. Belt speed, guided workouts,
heart-rate-steered pacing, a survey-exact 3D athletics track — no app store,
no account, no backend. Everything runs client-side and ships from a static
host.

## The problem

The Dreaver Motion One is a walking pad with a basic vendor app. I wanted
structured weight-loss workouts, heart-rate control, and progress tracking —
and I wanted to own the data instead of feeding another fitness cloud.

## The approach

- **Web Bluetooth** speaks the treadmill's FitShow FS-BT-T4 protocol
  directly from the browser — the tab *is* the controller
- **HR control loop**: connect any BLE heart-rate source (chest strap,
  broadcasting watch) and the app nudges belt speed to hold a target zone
- **A virtual 400m track**: survey-exact IAAF geometry — real lane staggers,
  relay zones, waterfall start — walkable as a 2D lap ring or first-person
  3D scenic walk with a distance-driven day/night cycle
- **Local-first**: all state lives in the browser; optional one-tap Strava
  upload and Withings weigh-in sync
- **Production discipline**: CI, E2E tests, and deploys via GitHub Actions

## The constraints

Web Bluetooth only exists in Chromium browsers — Safari and Firefox don't
ship it, so the controller is Chrome/Edge-only by platform reality, not by
choice. And a control loop for a physical belt someone is standing on gets
tested very, very carefully.

Built with Claude Code.
