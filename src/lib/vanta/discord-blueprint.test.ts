import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ROLES, CHANNELS, CATEGORIES, blueprintSummary, BLUEPRINT_VERSION } from "./discord-blueprint.ts";

describe("vanta discord blueprint", () => {
  it("has version and counts", () => {
    const s = blueprintSummary();
    assert.equal(s.version, BLUEPRINT_VERSION);
    assert.ok(s.roles >= 9);
    assert.ok(s.channels >= 30);
    assert.ok(s.categories >= 8);
  });
  it("includes required channels", () => {
    const names = CHANNELS.map((c) => c.name);
    for (const n of ["welcome", "rules", "general", "staff-chat", "audit-log", "security-alerts"]) {
      assert.ok(names.includes(n), `missing ${n}`);
    }
  });
  it("includes required roles", () => {
    const names = ROLES.map((r) => r.name);
    for (const n of ["Owner", "Moderator", "Member", "Restricted"]) {
      assert.ok(names.includes(n), `missing ${n}`);
    }
  });
});
