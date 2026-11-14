import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAuditLog } from "./audit-log.ts";

describe("vanta audit log", () => {
  it("records and filters", () => {
    const log = createAuditLog();
    log.record("mod1", "claim", "case_1");
    log.record("mod1", "resolve", "case_2");
    assert.equal(log.entries().length, 2);
    assert.equal(log.forTarget("case_1").length, 1);
  });
});
