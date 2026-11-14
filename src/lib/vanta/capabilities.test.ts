import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CAPABILITY_STATUSES,
  capabilityLabel,
  isCapabilityStatus,
} from "./capabilities.ts";

describe("capability statuses", () => {
  it("includes the required truth-matrix states", () => {
    assert.deepEqual(
      [...CAPABILITY_STATUSES].sort(),
      [
        "manual_fallback",
        "proven_sandbox",
        "prohibited",
        "requires_provider_approval",
        "requires_xbox_test",
        "unsupported",
        "verified",
      ].sort(),
    );
  });

  it("recognises only declared statuses", () => {
    assert.equal(isCapabilityStatus("verified"), true);
    assert.equal(isCapabilityStatus("prohibited"), true);
    assert.equal(isCapabilityStatus("maybe"), false);
    assert.equal(isCapabilityStatus(null), false);
  });

  it("maps statuses to human labels", () => {
    assert.equal(capabilityLabel("verified"), "Verified now");
    assert.equal(capabilityLabel("prohibited"), "Prohibited");
  });
});
