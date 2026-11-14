import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createCommerceStore, PLEDGE_TIERS } from "./commerce.ts";

describe("vanta commerce store", () => {
  it("lists tiers", () => {
    const store = createCommerceStore();
    assert.equal(store.tiers().length, PLEDGE_TIERS.length);
  });

  it("creates a pledge", () => {
    const store = createCommerceStore();
    const result = store.pledge("p1", "founder");
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.pledge.amountUsd, 25);
      assert.equal(result.pledge.status, "pending");
    }
    assert.equal(store.pledges().length, 1);
  });

  it("rejects unknown tier", () => {
    const store = createCommerceStore();
    const result = store.pledge("p1", "nope");
    assert.equal(result.ok, false);
  });

  it("refunds a pledge", () => {
    const store = createCommerceStore();
    const result = store.pledge("p1", "supporter");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(store.refund(result.pledge.id), true);
    assert.equal(store.pledges()[0].status, "refunded");
  });

  it("handles realm requests", () => {
    const store = createCommerceStore();
    const r = store.requestRealm("p1", "Tribe One", "Australia (AU)");
    assert.equal(r.status, "pending");
    assert.equal(store.realmRequests().length, 1);
    assert.equal(store.approveRealm(r.id), true);
    assert.equal(store.realmRequests()[0].status, "approved");
  });
});
