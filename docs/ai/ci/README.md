# CI files for HW 1.2

Copy-paste gates for your PR. They are **not active** in this repo: a file runs only once it is in
`.github/workflows/`. The scripts are dependency-free Node 24, byte-identical to `ci/` in
[koldovsky/2026-spd-shop-harness v1.6.0](https://github.com/koldovsky/2026-spd-shop-harness/tree/v1.6.0), where their
unit tests live. Adapt them if your team's rules differ — say what you changed in the PR.

| File | What to do with it |
|---|---|
| `trace-gate.yml` | copy to `.github/workflows/trace-gate.yml` (required for HW 1.2) |
| `diff-size.yml` | copy to `.github/workflows/diff-size.yml` (optional) |
| `trace-gate.mjs`, `diff-size.mjs` | leave here; the workflows run them from `docs/ai/ci/` |

## Trace gate — the PR fails when

1. the **PR title has no key** matching `TASK-[0-9]+`;
2. **any non-merge commit** in the PR has no `Refs:` trailer with that key;
3. the **evidence** doesn't hold up: the newest commit with an `Evidence:` trailer names a file that is missing at the
   head, or none of its files names a **verified revision** — a commit of this PR (full SHA or at least 7 hex
   characters) after which only files under `docs/evidence/` (or the files named in that trailer) changed.

It warns when the title doesn't start with the key or the branch name doesn't contain it.

An evidence file can't contain the SHA of its own commit. So: commit the change → run the checks → write the
evidence with that SHA → commit the evidence. A later code commit makes the evidence stale and the gate red.

## Diff-size gate — the PR fails when

- added + deleted lines in `base...head` are **above 400** (warning above 200);
- lockfiles, generated files, `.gitattributes` `linguist-generated` paths and `docs/evidence/**` don't count.

The defaults are a team choice, not a measurement. Change `SIZE_WARN`, `SIZE_FAIL`, `SIZE_EXCLUDE` in the workflow.

## Run them before you push

```bash
node docs/ai/ci/trace-gate.mjs --base origin/main --head HEAD --title "TASK-7 Whole-hour estimates" --key-pattern "TASK-[0-9]+"
```

```bash
node docs/ai/ci/diff-size.mjs --base origin/main --head HEAD
```

Exit code 0 = pass, 1 = a rule failed, 2 = missing `--base` or `--title`.

## In your fork

- **Actions are off in a fork** until you open the **Actions** tab and enable workflows.
- Open the PR **inside your fork**: base `<you>/2026-spd-ws1-homework-starter` `main`, not the upstream repo.
- The `edited` trigger re-runs the trace gate when you fix the PR title.
- Merge with **Create a merge commit**. Squash and rebase create new SHAs, and the evidence then names a commit that
  isn't on `main`.

## Alternative: the shared reusable workflow

A team with several repos keeps one copy of the scripts in the harness and calls them pinned to a tag:

```yaml
jobs:
  trace:
    uses: koldovsky/2026-spd-shop-harness/.github/workflows/trace-gate.yml@v1.6.0
    with:
      key-pattern: 'TASK-[0-9]+'
```
