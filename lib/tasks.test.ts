import { beforeEach, describe, expect, it } from "vitest";
import { openDb } from "./db";
import { createTask, listTasks, moveTask, RuleViolation } from "./tasks";
import type { DatabaseSync } from "node:sqlite";

let db: DatabaseSync;
beforeEach(() => {
  db = openDb(":memory:");
});

describe("tasks", () => {
  it("creates a task in todo", () => {
    const t = createTask(db, { title: "Write the team agreement", estimateHours: 2 });
    expect(t.status).toBe("todo");
    expect(listTasks(db)).toHaveLength(1);
  });

  it("rejects an empty title", () => {
    expect(() => createTask(db, { title: "  " })).toThrow(RuleViolation);
  });

  it("follows todo → doing → done and keeps done final", () => {
    const t = createTask(db, { title: "Add a hook" });
    moveTask(db, t.id, "doing");
    moveTask(db, t.id, "done");
    expect(() => moveTask(db, t.id, "todo")).toThrow(RuleViolation);
  });

  describe("estimateHours is a whole number 1..40 (TASK-7)", () => {
    const MESSAGE = "estimateHours must be a whole number 1..40";
    const create = (estimateHours: unknown) => createTask(db, { title: "Estimate", estimateHours: estimateHours as number });

    it.each([1, 40])("accepts %s", (hours) => {
      expect(create(hours).estimateHours).toBe(hours);
    });

    it.each([0, 41, 1.5, "3", "abc", null, NaN])("rejects %j with the agreed message", (hours) => {
      expect(() => create(hours)).toThrow(new RuleViolation(MESSAGE));
    });

    it("stores nothing when the estimate is rejected", () => {
      expect(() => create(1.5)).toThrow(RuleViolation);
      expect(listTasks(db)).toHaveLength(0);
    });

    it("creates a task without an estimate as null", () => {
      expect(createTask(db, { title: "No estimate" }).estimateHours).toBeNull();
    });
  });

  it("does not skip doing", () => {
    const t = createTask(db, { title: "Path rule" });
    expect(() => moveTask(db, t.id, "done")).toThrow(RuleViolation);
  });
});
