---
name: ship
description: The full PR loop for this repo — branch, build, commit, push, PR, CI wait, merge, cleanup. Use for EVERY change that lands in the repo, however small (copy tweaks, one-line CSS fixes, content edits), whenever the user asks to change/fix/add anything, and when they say "merge it" or "create a PR". Never commit directly to main.
---

# ship — the lokilabs.nl PR loop

Every change lands through this loop. `main` is deploy-on-push (Cloudflare
Workers Builds), so committing to it directly ships to production unreviewed —
that's why the branch/PR rule exists, even for one-liners.

## 1. Start clean

```bash
git checkout main && git pull
git checkout -b <fix|feat|docs|chore>/<topic>   # conventional prefix, kebab topic
```

If a previous branch was merged, delete it first (see step 6) — stale local
branches accumulate otherwise.

## 2. Make the change, then prove it builds

```bash
mise exec -- pnpm build
```

Build must pass before committing — zod validates content frontmatter at
build time, so this is also the content lint. For visual changes, verify with
the **visual-verify** skill before pushing; reviewers here are humans looking
at preview deploys, and a broken layout wastes a round-trip.

## 3. Commit

Conventional subject, lowercase, imperative: `fix: ...`, `feat: ...`,
`docs: ...`, `chore: ...`. One logical change per commit. No trailing period.

## 4. Push + PR

```bash
git push -u origin <branch>
gh pr create --title "<type>: <summary>" --body "<what + why, bullet list>"
gh pr list --head <branch> --json url -q '.[0].url'   # gh sometimes swallows the URL
```

Report the PR URL to Ronald. PRs get a Cloudflare preview deploy automatically.

## 5. CI + merge

CI runs `astro check`, `pnpm build`, and a lychee link check. To wait without
polling noise:

```bash
until gh pr checks <N> 2>/dev/null | grep -qvE 'pending|no checks'; do sleep 15; done; gh pr checks <N>
```

(run in background). **Merge only when Ronald says to** — "merge it" is the
signal; a green CI is not. When told:

```bash
gh pr merge <N> --merge --delete-branch
```

## 6. Cleanup after merge

```bash
git checkout main && git pull
git branch -D <branch>                      # local
git push origin --delete <branch> 2>/dev/null  # in case --delete-branch missed it
```

Leave main in sync — the next change starts from step 1.
