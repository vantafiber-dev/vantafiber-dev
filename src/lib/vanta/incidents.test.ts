import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createIncidentStore } from "./incidents.ts";

describe("vanta incident store", () => {
  it("opens and resolves", () => {
    const store = createIncidentStore();
    const i = store.open("DB outage", "high");
    assert.equal(i.status, "open");
    assert.equal(store.mitigate(i.id, "failover"), true);
    assert.equal(store.resolve(i.id, "restored"), true);
    assert.equal(store.list()[0].status, "resolved");
  });
});
