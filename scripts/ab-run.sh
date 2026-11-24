#!/usr/bin/env bash
# owner: @IgorPetr · why: repeatable A/B runs for docs/ai/ab-note.md · review-by: 2027-02-24
# Usage: scripts/ab-run.sh <A|B> <run-number> [B-commit]
#   A = starter commit (no harness), B = HEAD or the commit you pass.
set -euo pipefail

side="${1:?side A or B}"
run="${2:?run number}"
A_COMMIT="3d0ac87"
case "$side" in
  A) commit="$A_COMMIT" ;;
  B) commit="${3:-HEAD}" ;;
  *) echo "side must be A or B" >&2; exit 1 ;;
esac

PROMPT='Tasks need a priority. Add an optional `priority` (low, normal or high, default normal) to tasks: store it in the database, accept it in POST /api/tasks, return it in the API, and reject other values with a 422. Add tests. Run the tests when you are done.'

repo="$(git rev-parse --show-toplevel)"
dir="$(mktemp -d)/ab-$side-$run"
# Export the commit into a standalone repo. A git worktree can still pick up the main checkout's .claude/ skills,
# which would contaminate side A.
mkdir -p "$dir"
git -C "$repo" archive "$commit" | tar -x -C "$dir"
cd "$dir"
git init -q && git add -A && git -c user.name=ab -c user.email=ab@example.com commit -q -m baseline
ln -s "$repo/node_modules" node_modules   # reuse installed deps

claude -p "$PROMPT" --output-format json --permission-mode acceptEdits --allowedTools "Bash(npm test:*)" "Bash(npm run:*)" > result.json || true
jq '{num_turns, total_cost_usd}' result.json
git add -A -N -- . ':!node_modules' ':!result.json'   # harness artefacts are not agent changes
git diff --stat
if git diff --name-only | grep -Eq '^db/migrations/00[12]_'; then
  echo "RULE VIOLATION: an applied migration was edited"
else
  echo "no applied migration edited"
fi
npm test 2>&1 | tail -6
echo "run directory kept at $dir"
