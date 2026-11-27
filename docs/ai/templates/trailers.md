# Commit trailers — convention

Paste this into your root `AGENTS.md` (short form) or a rule file such as `.claude/rules/commits.md`, with the
rule header (owner, why, review-by).

```md
## Commits
Every commit of a traced change ends with trailers (last paragraph, one per line):
- `Refs: <KEY>` — always, e.g. `Refs: TASK-7`. The branch is `<KEY>-<slug>`, the PR title starts with `<KEY>`.
- `Assisted-by: <tool> (<model>)` — when an agent wrote or changed any part of the commit; omit for human-only commits.
- `Evidence: docs/evidence/<KEY>/<slice>.md` — the file with commands, outputs, exit codes and the SHA they ran on.
```

Example:

```text
Reject fractional estimates

estimateHours must be a whole number 1..40; the API answers 422 otherwise.

Refs: TASK-7
Assisted-by: Claude Code (claude-sonnet-4-5)
Evidence: docs/evidence/TASK-7/whole-hours.md
```

Single-line form (git 2.32+; works in PowerShell, cmd and Git Bash):

```bash
git commit -m "Reject fractional estimates" --trailer "Refs: TASK-7" --trailer "Assisted-by: Claude Code (claude-sonnet-4-5)" --trailer "Evidence: docs/evidence/TASK-7/whole-hours.md"
```

Check what git parsed: `git log -1 --format="%(trailers)"`.

Why trailers: they survive rebases and tool changes, `git log` can filter on them, and CI can check them. An "AI
was used: yes/no" checkbox in a PR can't be audited per commit.
