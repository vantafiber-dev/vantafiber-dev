import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createReportStore } from "./reports.ts";

describe("vanta report store", () => {
  it("creates a case", () => {
    const store = createReportStore();
    const c = store.create({ playerId: "p1", category: "cheat", subject: "aimbot", body: "details" });
    assert.equal(c.status, "open");
    assert.equal(store.list().length, 1);
  });

  it("claims, evidence, resolves, appeals", () => {
    const store = createReportStore();
    const c = store.create({ playerId: "p1", category: "cheat", subject: "x", body: "y" });
    assert.equal(store.claim(c.id, "mod1"), true);
    assert.equal(store.addEvidence(c.id, "screenshot"), true);
    assert.equal(store.resolve(c.id, "confirmed ban"), true);
    assert.equal(store.appeal(c.id, "false positive"), true);
    const updated = store.list()[0];
    assert.equal(updated.status, "appealed");
    assert.equal(updated.evidence.length, 1);
  });

  it("rejects invalid transitions", () => {
    const store = createReportStore();
    const c = store.create({ playerId: "p1", category: "cheat", subject: "x", body: "y" });
    assert.equal(store.resolve(c.id, "no evidence"), false);
    assert.equal(store.appeal(c.id, "x"), false);
  });
});
