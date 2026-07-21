---
title: "homelab"
description: "GitOps-managed Kubernetes cluster on Raspberry Pi CM5 — run like production."
tech: ["kubernetes", "k3s", "fluxcd", "longhorn", "metallb", "prometheus", "grafana"]
repo: "https://github.com/ronaldlokers/homelab"
order: 0
featured: true
---

A multi-node Kubernetes homelab that refuses to behave like a homelab.

- **Production**: three HA control planes (k3s) on Raspberry Pi CM5 hardware,
  Longhorn replicated storage, MetalLB load balancing
- **Staging**: a k3d cluster that mirrors production, because you don't test
  in prod — not even at home
- **GitOps end to end**: FluxCD reconciles the cluster from this repo.
  Nothing is applied by hand; the Git history *is* the change log
- **Observability**: Prometheus and Grafana with dashboards and alerting
- **Renovate** keeps every chart and image current via automated PRs

This is where the platform engineering pivot lives in practice: every concept
I want to learn gets deployed, monitored, broken, and fixed here first.
