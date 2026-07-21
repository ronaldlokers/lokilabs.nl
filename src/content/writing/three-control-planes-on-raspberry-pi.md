---
title: "three control planes on a stack of raspberry pis"
description: "Why my homelab runs HA Kubernetes — and what etcd quorum teaches you at 4 in the morning."
pubDate: 2026-07-15
tags: ["kubernetes", "homelab", "gitops"]
---

Most homelabs are a single node with a note that says "don't touch". Mine has
three control planes. People ask why. The answer is the whole point of the
lab: **if it can't survive a node dying, I'm not learning anything.**

## The hardware

Raspberry Pi CM5 modules, running k3s. Three of them form the control plane —
`control-plane,etcd` roles on every node:

```
NAME     STATUS   ROLES                AGE    VERSION
cm5-01   Ready    control-plane,etcd   212d   v1.33.6+k3s1
cm5-02   Ready    control-plane,etcd   212d   v1.33.6+k3s1
cm5-03   Ready    control-plane,etcd   211d   v1.33.6+k3s1
```

Three isn't a random number. etcd needs quorum: with three members you can
lose one node and keep a majority. Two nodes would actually be *worse* than
one — lose either and the whole cluster freezes. The smallest honest HA
setup is three, so three it is.

## The rules

The cluster runs like production, which means production rules:

- **Everything is declared in Git.** FluxCD reconciles the cluster from the
  [repo](https://github.com/ronaldlokers/homelab). Nothing is ever
  `kubectl apply`'d by hand. If it's not in Git, it doesn't exist.
- **Storage is replicated.** Longhorn keeps three replicas of every volume,
  so a dead node doesn't take data with it.
- **There's a real load balancer.** MetalLB hands out addresses, because
  `NodePort` is not a personality.
- **Dependencies don't rot.** Renovate opens PRs for every chart and image
  update. I review and merge like it's a team repo, because future me *is*
  the team.
- **There's a staging environment.** A k3d cluster mirrors production,
  because you don't test in prod. Not even at home.

## What it actually teaches

Pulling the plug on a node and watching the cluster shrug is the lesson you
can't get from a course. Workloads reschedule, Longhorn rebuilds replicas,
etcd keeps quorum, and the Grafana dashboards show you exactly what happened
and when.

And when something *doesn't* shrug — when a reconciliation loop gets stuck
or a volume won't reattach — that's the good part. Production incidents at
home cost nothing and teach everything.

The pile of Pis is small. The habits it builds aren't.
