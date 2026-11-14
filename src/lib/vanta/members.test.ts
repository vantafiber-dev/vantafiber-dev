import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMemberStore } from "./members.ts";

describe("vanta member store", () => {
  it("creates tribes and joins", () => {
    const store = createMemberStore();
    const tribe = store.createTribe("Vanta Vanguard", "Australia (AU)", "Hold the line");
    assert.equal(store.tribes().length, 1);
    assert.equal(store.joinTribe("m_seed", tribe.id), true);
    const member = store.members().find((m) => m.id === "m_seed");
    assert.equal(member?.tribeId, tribe.id);
  });

  it("rejects join for unknown tribe/member", () => {
    const store = createMemberStore();
    assert.equal(store.joinTribe("nope", "tribe_1"), false);
    assert.equal(store.joinTribe("m_seed", "nope"), false);
  });

  it("leaves tribe", () => {
    const store = createMemberStore();
    const tribe = store.createTribe("T", "EU", "m");
    store.joinTribe("m_seed", tribe.id);
    assert.equal(store.leaveTribe("m_seed"), true);
    const member = store.members().find((m) => m.id === "m_seed");
    assert.equal(member?.tribeId, undefined);
  });

  it("sets role and reputation", () => {
    const store = createMemberStore();
    assert.equal(store.setRole("m_seed", "officer"), true);
    assert.equal(store.reputation("m_seed", 10), 10);
    assert.equal(store.reputation("m_seed", -3), 7);
  });
});
