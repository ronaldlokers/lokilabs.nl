---
title: "from frontend to platform"
description: "Fifteen years of building UIs taught me I like the pipelines behind them more. So I switched."
pubDate: 2026-07-20
tags: ["career", "platform-engineering"]
---

Fifteen years of frontend and fullstack work — Coolblue, Mendix, Oliver IT —
and a pattern I could no longer ignore: every project, I'd finish the UI work
and then drift toward the build config. The webpack setup nobody wanted to
touch. The flaky pipeline. The deploy that took forty minutes and failed at
minute thirty-nine. That was the part I looked forward to.

A health-related career break forced the question directly: if I get to
choose again, what do I choose? (Health is fully under control — this isn't
that kind of post.) The answer wasn't "more UIs."

## So I built production at home

Since mid-2025 I've gone all-in on platform engineering. Not with a course
and a certificate — with a cluster:

- **Kubernetes on Raspberry Pi CM5 hardware** — three HA control planes,
  because if it can't survive a node dying, it's a toy
- **GitOps with FluxCD** — every workload, every config, declared in Git.
  The cluster state *is* the repo ([see for yourself](https://github.com/ronaldlokers/homelab))
- **Observability that answers questions** — Prometheus and Grafana with
  real dashboards and real alerting, not a default install
- **Longhorn** for replicated storage, **MetalLB** for load balancing,
  **Renovate** so dependencies never rot

Daily driver is Arch Linux. Everything I learned about developer experience
in fifteen years of frontend now goes into pipelines other developers would
actually enjoy using.

## Why "lokilabs"

*Loki* from Lokers, *labs* from what this actually is: a lab. This site is
where I write down what the lab teaches me. Expect posts about the cluster,
CI/CD design, AI tooling, and the occasional thing that caught fire.

If you're hiring for a Platform or DevOps role and want someone who's seen
both sides of the deploy button: [ronald@lokilabs.nl](mailto:ronald@lokilabs.nl).
