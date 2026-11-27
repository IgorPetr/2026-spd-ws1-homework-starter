# Spec — TASK-7 Estimates in whole hours

<!-- owner: @IgorPetr · why: HW 1.2 — the agreed behaviour is written down before the code, so tests and review check against it · review-by: 2027-02-24 -->

- Ticket: [docs/tickets/TASK-7.md](../tickets/TASK-7.md)
- Drafted by: Claude Code (claude-sonnet-5-5), from the ticket and the current code in `lib/tasks.ts`
- **Approved by:** Ihor Petrovshchenko (@IgorPetr), 2026-11-27, before implementation. The PR description repeats this.

## Behaviour

`createTask` in `lib/tasks.ts` validates `estimateHours` before anything is written:

| Input | Result |
|---|---|
| field omitted (`undefined`) | accepted; stored and returned as `estimateHours: null` |
| a whole number 1 to 40, type `number` | accepted |
| anything else | `RuleViolation("estimateHours must be a whole number 1..40")`, nothing stored |

"Anything else" means: `0`, `41`, negative numbers, fractions such as `1.5`, `NaN`, `Infinity`, strings (`"3"`, `"abc"`),
`null`, booleans, objects and arrays.

`POST /api/tasks` maps `RuleViolation` to **422** with `{ "error": "<message>" }` and a successful create to **201**.
This mapping already exists in `app/api/tasks/route.ts`; the route does not change.

## Decisions the ticket leaves open

1. **`null` is rejected.** The ticket says "when present", and an explicit `null` is present but not a number. Only omitting the field gives `null`.
2. **No coercion.** `"3"` is rejected, not converted to `3`.
3. **One message for every rejection**, range or type: `estimateHours must be a whole number 1..40`. It replaces the old `estimateHours must be 1..40`.
4. **JSON `1.0` is accepted**, because `JSON.parse` turns it into the number `1`; the server cannot tell the two apart.
5. **Order of checks:** title first, then estimate, as today. A request with both wrong reports the title error.
6. **Single place for the rule:** `lib/tasks.ts` only. The route and the database check stay as they are.

## Acceptance criteria

These are the ticket's criteria, with the test that proves each.

| # | Criterion | Proof |
|---|---|---|
| 1 | `1` and `40` accepted; `0`, `41`, `1.5`, `"3"`, `"abc"` rejected with the message above | one unit test per value in `lib/tasks.test.ts` |
| 2 | `POST /api/tasks` gives 422 for a rejected estimate and 201 for an accepted one | the route is unchanged and maps `RuleViolation` to 422; checked with real HTTP requests, recorded in the evidence file |
| 3 | A task without `estimateHours` is created with `estimateHours: null` | unit test |
| 4 | Every case in (1) has a unit test | the list below |

## Test list (`lib/tasks.test.ts`)

- accepts `1` (lower boundary)
- accepts `40` (upper boundary)
- rejects `0`, `41`, `1.5`, `"3"`, `"abc"` with the exact message
- rejects `null` and `NaN` (decisions 1 and open cases) with the exact message
- a rejected estimate leaves no row in the database
- omitted `estimateHours` is created as `null`

## Non-goals

- No database migration. The `check (estimate_hours between 1 and 40)` in `002_add_task_estimate.sql` stays.
- No UI change, no change to titles or status transitions.
- No route-level test harness (the repo has none; adding one is a separate change).
- No coercion of strings to numbers.
