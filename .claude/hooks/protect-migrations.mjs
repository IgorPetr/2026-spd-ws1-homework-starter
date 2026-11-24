// owner: @IgorPetr · why: applied migrations must never change; lib/db.ts skips a file once applied, so an edit makes databases diverge silently · review-by: 2027-02-24
// PreToolUse hook for Edit|Write|MultiEdit. Exit 2 blocks the call and stderr is shown to the agent.
// Creating a NEW file in db/migrations/ is allowed; changing an existing one is not.
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0); // not our payload; do not block on a parse error
}

const root = resolve(process.env.CLAUDE_PROJECT_DIR ?? payload.cwd ?? process.cwd());
const filePath = payload.tool_input?.file_path;
if (typeof filePath !== "string") process.exit(0);

const abs = resolve(root, filePath);
const rel = relative(root, abs).split("\\").join("/");

if (rel.startsWith("db/migrations/") && existsSync(abs)) {
  const reason =
    `BLOCKED: ${rel} is an applied migration and must not be edited. ` +
    `Add a new numbered file in db/migrations/ instead (see .claude/skills/add-migration/SKILL.md).`;
  try {
    appendFileSync(
      resolve(root, ".claude/hooks/block.log"),
      `${new Date().toISOString()} ${payload.tool_name ?? "?"} ${rel} BLOCKED\n`,
    );
  } catch {
    // logging must never decide the outcome
  }
  console.error(reason);
  process.exit(2);
}
process.exit(0);
