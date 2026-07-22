---
name: design-sync
description: Read from or write to the "Loki Labs branding design" Claude Design project via the DesignSync tool. Use whenever the user references the design project, asks to sync mockups/designs, wants brand assets fetched, or says "update the design". Contains the clobber-prevention rule — read this before ANY DesignSync write.
---

# design-sync — the Loki Labs design project

Project id: `aeb25f86-af30-4bf8-9596-664b5cc2a38a`. Source of truth for brand
(palette, portrait, mockups). Key files: `Loki Labs Handoff.dc.html` (brand
spec), `Loki Labs Website Mockups.dc.html` (page comps), `assets/face-line-violet.png`
(the mark — Ronald's line-art headshot, never call it a fox).

## Reading

- `list_files` for structure; `get_file` for content.
- **`get_file` truncates at 256KiB** — always check the `truncated` flag.
  Large binaries (the portrait PNG) can't be fetched whole; ask Ronald to
  export from the app and drop the file in `~/Downloads` instead.

## Writing — the clobber rule

`write_files` is a **full-file replace**. Ronald edits designs in the app, so
a stale base silently destroys his work (happened once). Therefore:

1. `get_file` the target **immediately before** `finalize_plan` — not from an
   earlier fetch in the session, however recent it feels.
2. Build the new content on top of that fresh copy.
3. `finalize_plan` (needs `writes`, `deletes` — pass `[]` if none — and
   `localDir`), then `write_files` with `localPath`.
4. After writing, `get_file` once more to confirm the remote matches.

## Local copies

Synced files keep a copy in `docs/design-sync/` (committed via the **ship**
skill) so future syncs have a diffable base. Mockup pages use the `x-dc`
wrapper + Google-Fonts Fira Code + `design_doc_mode: canvas` helmet — copy the
existing file's frame when adding pages.
