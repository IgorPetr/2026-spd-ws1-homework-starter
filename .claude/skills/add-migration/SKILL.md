---
name: add-migration
description: Add a new SQLite schema change to the Team Tasks app (new column, table or constraint) without touching applied migrations. Use when the task needs a database change.
---
<!-- owner: @IgorPetr · why: schema changes are the riskiest repeated task here; people kept wanting to edit 002 instead of adding 003 · review-by: 2027-02-24 -->

# Add a migration

1. List `db/migrations/` and take the next number, for example `003_`. Never edit `001_*` or `002_*` (the hook will block it).
2. Create `db/migrations/NNN_short_description.sql` with one change. Follow `.claude/rules/migrations.md`.
3. Mirror the rule in code: update the type and `toTask` in `lib/tasks.ts`, and the validation in `createTask` if the rule is an app rule.
4. Add or extend a test in `lib/tasks.test.ts` that fails without the change.
5. If the route accepts the new field, update `app/api/tasks/route.ts` and keep it thin (parse, call `lib/tasks.ts`, map `RuleViolation` to 422).
6. If a table in `README.md` describes the schema, update it.
7. Check, in this order, and show the output:
   - `npm run db:reset` (starts from an empty DB so every migration runs)
   - `npm test`
   - `npm run typecheck`
8. In the PR text add one line on how to undo the migration (usually a new migration that reverses it).

Done means all three commands in step 7 pass and `git diff --stat` shows no change to an old migration.
