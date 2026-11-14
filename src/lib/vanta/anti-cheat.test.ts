import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAntiCheatStore } from "./anti-cheat.ts";

describe("vanta anti-cheat store", () => {
  it("reports an anomaly", () => {
    const store = createAntiCheatStore();
    const a = store.report("p1", "meshing", "high");
    assert.equal(a.status, "open");
    assert.equal(store.list().length, 1);
  });

  it("investigates and confirms", () => {
    const store = createAntiCheatStore();
    const a = store.report("p1", "duping", "critical");
    assert.equal(store.investigate(a.id), true);
    assert.equal(store.confirm(a.id, "evidence found"), true);
    assert.equal(store.list()[0].status, "confirmed");
  });

  it("dismisses with note", () => {
    const store = createAntiCheatStore();
    const a = store.report("p2", "speed", "low");
    assert.equal(store.dismiss(a.id, "false positive"), true);
    assert.equal(store.list()[0].notes.length, 1);
  });
});
