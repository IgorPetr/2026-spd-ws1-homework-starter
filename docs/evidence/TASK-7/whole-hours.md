# Evidence — TASK-7 whole-hours

- Revision: `cd848e06954ae6d00e7601687351c3eadc895941` (`git rev-parse HEAD` before this file was written; the code commit "Reject fractional and non-numeric estimates")
- Ran: 2026-11-27 15:13 UTC, Linux 7.0.0-44-generic aarch64, Node v24.22.3, Claude Code 2.1.330 (Claude Code)
- Who ran it: Claude Code (claude-sonnet-5-5), driven by @IgorPetr
- Working tree at the time: clean (only the untracked, uncommitted `.idea/` of the IDE)

## `npm test`

```text

> ws1-homework-starter@0.1.0 test
> vitest run


 RUN  v5.1.0 /home/myname/IdeaProjects/2026-spd-ws1-homework-starter


 Test Files  1 passed (1)
      Tests  15 passed (15)
   Start at  17:13:22
   Duration  228ms (import 39%, tests 32%, transform 25%, worker 3%)
```

Exit code: 0

New tests, in `lib/tasks.test.ts`: accepts 1 and 40; rejects 0, 41, 1.5, "3", "abc", null and NaN with the agreed message; a rejected
estimate stores nothing; an omitted estimate is `null`. Run against the previous `lib/tasks.ts` (`git stash push lib/tasks.ts`, then
`npm test`) 8 of the new tests failed (0, 41, 1.5, "3", "abc", null, NaN and the "stores nothing" test); with the change all 15 pass.

## `npm run typecheck`

```text

> ws1-homework-starter@0.1.0 typecheck
> tsc --noEmit
```

Exit code: 0

## Acceptance criterion 2 — real HTTP against `next dev`

Script: `DB_FILE=:memory: npm run dev`, then `curl -X POST /api/tasks` with each body. Output as printed, the server was stopped afterwards.

```text
estimateHours 1                   {"id":1,"title":"a","status":"todo","assignee":null,"estimateHours":1,"createdAt":"2026-11-27T15:13:01.671Z"} -> HTTP 201
estimateHours 40                  {"id":2,"title":"a","status":"todo","assignee":null,"estimateHours":40,"createdAt":"2026-11-27T15:13:01.705Z"} -> HTTP 201
estimateHours omitted             {"id":3,"title":"a","status":"todo","assignee":null,"estimateHours":null,"createdAt":"2026-11-27T15:13:01.757Z"} -> HTTP 201
estimateHours 0                   {"error":"estimateHours must be a whole number 1..40"} -> HTTP 422
estimateHours 41                  {"error":"estimateHours must be a whole number 1..40"} -> HTTP 422
estimateHours 1.5                 {"error":"estimateHours must be a whole number 1..40"} -> HTTP 422
estimateHours "3"                 {"error":"estimateHours must be a whole number 1..40"} -> HTTP 422
estimateHours "abc"               {"error":"estimateHours must be a whole number 1..40"} -> HTTP 422
--- GET /api/tasks (only the accepted three should exist)
[{"id":1,"title":"a","status":"todo","assignee":null,"estimateHours":1,"createdAt":"2026-11-27T15:13:01.671Z"},{"id":2,"title":"a","status":"todo","assignee":null,"estimateHours":40,"createdAt":"2026-11-27T15:13:01.705Z"},{"id":3,"title":"a","status":"todo","assignee":null,"estimateHours":null,"createdAt":"2026-11-27T15:13:01.757Z"}]
 -> HTTP 200
server stopped
```

## Trace gate, run locally on this revision before the evidence commit

Base `d0aa10b` = the merge commit that holds the harness and the HW 1.2 kit, i.e. what the fork's `main` is when the PR opens.

Correct title, no evidence commit yet:

```text
key TASK-7 (from the PR title)
3 commit(s), 3 with Assisted-by
::error::no commit carries an Evidence: trailer (e.g. Evidence: docs/evidence/<KEY>/<slice>.md)
trace gate: FAIL (1 error(s))
```

Exit code: 1

Title without a key (shows the gate also checks the title):

```text
3 commit(s), 3 with Assisted-by
::error::PR title has no requirement key matching /TASK-[0-9]+/: "Whole-hour estimates"
::error::no commit carries an Evidence: trailer (e.g. Evidence: docs/evidence/<KEY>/<slice>.md)
trace gate: FAIL (2 error(s))
```

Exit code: 1

The green run on the final head is recorded in the PR (CI run link); it cannot be written here, because this file cannot name the commit that adds it.

## Not verified

- No route-level automated test: the repo has no harness for route handlers, and the spec lists it as a non-goal. Acceptance criterion 2 rests on the manual requests above.
- Not run against an on-disk database (`data/tasks.db`); the HTTP check used `:memory:`.
- Linux aarch64 only; not run on Windows or macOS.
- CI (GitHub Actions) not run by me: pushing and enabling Actions in the fork are done by the author.
