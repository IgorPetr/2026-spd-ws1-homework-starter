<!-- owner: @IgorPetr · why: HW 1.2 — anyone must be able to walk from a merged commit back to the ticket, the spec, the evidence and the agent involved; a PR checkbox "AI used" cannot be audited per commit · review-by: 2027-02-24 -->

# Commits

Every commit of a traced change ends with trailers (last paragraph, one per line):
- `Refs: <KEY>` — always, e.g. `Refs: TASK-7`. The branch is `<KEY>-<slug>`, the PR title starts with `<KEY>`.
- `Assisted-by: <tool> (<model>)` — when an agent wrote or changed any part of the commit; omit for human-only commits.
- `Evidence: docs/evidence/<KEY>/<slice>.md` — the file with commands, outputs, exit codes and the SHA they ran on.
  Only the evidence commit carries it. Write it after the code commit it names; a later code commit makes it stale.

Example:

```text
Reject fractional estimates

estimateHours must be a whole number 1..40; the API answers 422 otherwise.

Refs: TASK-7
Assisted-by: Claude Code (claude-sonnet-5-5)
Evidence: docs/evidence/TASK-7/whole-hours.md
```

Single line: `git commit -m "Reject fractional estimates" --trailer "Refs: TASK-7" --trailer "Assisted-by: Claude Code (claude-sonnet-5-5)"`.
Check what git parsed: `git log -1 --format="%(trailers)"`. The CI trace gate (`.github/workflows/trace-gate.yml`) fails a PR whose
title has no key or whose non-merge commits lack `Refs:`.
