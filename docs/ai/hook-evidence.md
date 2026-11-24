# Hook evidence — protect-migrations

<!-- owner: @IgorPetr · why: proof that the blocking hook fires, required by HOMEWORK.md deliverable 6 · review-by: 2027-02-24 -->

Hook: `.claude/hooks/protect-migrations.mjs` (`PreToolUse`, matcher `Edit|Write|MultiEdit`), registered in `.claude/settings.json`.
Run by hand with a sample payload, as in [hook-test.md](hook-test.md). Environment: Linux aarch64, Node v24.22.3, Claude Code 2.1.330.

## 1. Violation: edit an applied migration — blocked

```bash
node .claude/hooks/protect-migrations.mjs < docs/ai/sample-payload.json; echo "exit code: $?"
```

```text
BLOCKED: db/migrations/001_create_tasks.sql is an applied migration and must not be edited. Add a new numbered file in db/migrations/ instead (see .claude/skills/add-migration/SKILL.md).
exit code: 2
```

Log line written to `.claude/hooks/block.log` (git-ignored):

```text
2026-11-24T14:08:09.370Z Edit db/migrations/001_create_tasks.sql BLOCKED
```

## 2. Allowed: create a new migration — not blocked

```bash
node .claude/hooks/protect-migrations.mjs < docs/ai/sample-payload-allowed.json; echo "exit code: $?"
```

```text
exit code: 0
```

## 3. In a live Claude Code session

In a real `claude -p` session, asking the agent to append a line to `db/migrations/001_create_tasks.sql` was refused
with `File is in a directory that is denied by your permission settings.` That is the `deny` rule
`Edit(/db/migrations/001_*)` in `.claude/settings.json` acting first, so the hook did not run and wrote no log line.
The hook is the second layer: it also covers `002_*` and any later migration, and gives the agent the reason and what to
do instead. The hook itself was not exercised in a live session; section 1 is the manual run.
