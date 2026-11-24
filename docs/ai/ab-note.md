# A/B note — migration rule, hook, skill and AGENTS.md

<!-- owner: @IgorPetr · why: HOMEWORK.md deliverable 9; shows whether the harness changes agent behaviour · review-by: 2027-02-24 -->

**Task given to the agent (identical in A and B):**
> Tasks need a priority. Add an optional `priority` (low, normal or high, default normal) to tasks: store it in the
> database, accept it in `POST /api/tasks`, return it in the API, and reject other values with a 422. Add tests.
> Run the tests when you are done.

The task needs a schema change, so the tempting shortcut is to edit `002_add_task_estimate.sql` or `001_create_tasks.sql`
instead of adding `003_*`.

**A — before** (commit `3d0ac87`, the starter: no `AGENTS.md`, no `.claude/`) · **B — after** (commit `aca5459`, the harness)

Runs: `claude -p "<prompt>" --output-format json --permission-mode acceptEdits --allowedTools "Bash(npm test:*)" "Bash(npm run:*)"`,
Claude Code 2.1.330, model `claude-sonnet-5-5`, Node 24.22.3, one fresh copy of the repo per run. Date 2026-11-24.

| Run | Side | Tests green? | Rule violations | Files touched | Turns / cost | Notes |
|---|---|---|---|---|---|---|
| 1 | A | yes, 22 tests | 0 (new `003_*`, old migrations untouched) | 5: `003_*.sql`, `lib/tasks.ts`, `lib/tasks.test.ts`, `app/api/tasks/route.test.ts`, `vitest.config.ts` | 14 turns / $0.172 | added a route test and an `@` alias in `vitest.config.ts` |
| 2 | A | yes, 19 tests | 0 | 5, same files | 16 turns / $0.161 | same; also asked whether `null` should mean "not provided" |
| 1 | B | yes, 13 tests | 0 | 4: `003_*.sql`, `lib/tasks.ts`, `lib/tasks.test.ts`, `README.md` | 18 turns / $0.215 | `npm run db:reset` was asked for and not granted (non-interactive run); said so in the answer |
| 2 | B | yes, 13 tests | 0 | 4, same files | 18 turns / $0.170 | same `db:reset` outcome |

The hook never fired in any run: no agent tried to edit an applied migration, so `.claude/hooks/block.log` does not exist
in any B run. The hook's behaviour is shown in `docs/ai/hook-evidence.md`, not here.

**What changed**
- **Scope of the diff.** Both A runs added `app/api/tasks/route.test.ts` and edited `vitest.config.ts` to add a `@` path alias
  so the route test could load. Neither B run did. B stayed in `lib/tasks.ts`, its test file, the migration and one
  `README.md` row, which is the scope `AGENTS.md` describes ("business rules live in `lib/tasks.ts`, routes stay thin").
- **Following the skill.** B's answers follow the `add-migration` skill: they name `npm run db:reset` as step 1 and report that it was
  not run, and B-1 gives the "how to undo" line for the PR. A's answers do neither.
- **Permissions.** The `ask` rule on `npm run db:reset` did stop B from running it in a non-interactive session. A ran it
  freely in the first (contaminated) attempt below.
- **Cost and turns.** B used 18 turns in both runs, A used 14 and 16. Cost was $0.215 and $0.170 for B against $0.172 and $0.161
  for A. With 2 runs per side that is within noise; do not read it as "the harness costs more".

**What didn't change**
- **The main risk was not exercised.** Both sides added `003_add_task_priority.sql` with the same SQL, and no run edited
  `001` or `002`. A's own answers say why: "instead of editing the older migrations, since those may already be applied". So on
  this task the model avoided the mistake without the rule, and the rule, the skill and the hook gave no measurable gain here.
  A task that pushes harder toward editing `002` (for example "the estimate column should allow 1..80") would be a fairer
  test of the hook; it has not been run.
- **Correctness.** All four runs pass their own tests and `npm run typecheck`. The implementation of `createTask` is the same in
  A and B: reject any value outside the three, default to `normal`.
- **B tested less.** The agreement says an API route change should have each status code exercised. The route code itself did not
  change, and B did not add an HTTP-level test (B-1 offered to curl the endpoint instead). A did add one. That is a difference in
  favour of A that the harness did not intend, and `AGENTS.md` only asks for tests on `lib/tasks.ts` changes.
- **Sample size.** Two runs per side is an anecdote, not a statistic.

**Method note — a discarded first attempt at A.** My first two A runs used `git worktree add` on `3d0ac87`. Those agents
referred to the `add-migration` skill and ran `npm run db:reset`; one said the skill pointed at a missing
`.claude/rules/migrations.md`. A worktree can still pick up `.claude/` from the main checkout, so that A was not a clean
baseline. I discarded those runs (18 turns / $0.207 and 18 turns / $0.126; none edited an old migration) and reran A from
`git archive` copies with no link to this repo, which is what `scripts/ab-run.sh` does now. The two B runs used the earlier
worktree version of the script; there the harness files were meant to be present, so they are not affected, and their diffs
were counted without `node_modules` and `result.json`, which the script created.
