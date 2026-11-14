import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWipeRehearsal, runWipeRehearsal, rehearsalSummary } from "./wipe-rehearsal.ts";

describe("vanta wipe rehearsal", () => {
  it("passes all steps on success", () => {
    const r = runWipeRehearsal(createWipeRehearsal());
    assert.equal(r.overall, "passed");
    assert.equal(r.steps.every((s) => s.status === "passed"), true);
    assert.match(rehearsalSummary(r), /8\/8 steps passed/);
  });

  it("stops on simulated failure", () => {
    const r = runWipeRehearsal(createWipeRehearsal(), "wipe_save");
    assert.equal(r.overall, "failed");
    const failed = r.steps.find((s) => s.id === "wipe_save");
    assert.equal(failed?.status, "failed");
    const pending = r.steps.filter((s) => s.status === "pending");
    assert.ok(pending.length > 0);
  });
});
