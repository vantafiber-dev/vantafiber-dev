import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createLfgStore, createTicketStore } from "./community.ts";

describe("vanta lfg store", () => {
  it("creates and lists posts", () => {
    const store = createLfgStore();
    const post = store.create({ playerId: "p1", region: "Australia (AU)", mode: "pvp", title: "Need 2 for raid", note: "mic required" });
    assert.equal(post.status, "open");
    assert.equal(store.list().length, 1);
  });

  it("closes only the owner's post", () => {
    const store = createLfgStore();
    const post = store.create({ playerId: "p1", region: "Australia (AU)", mode: "pvp", title: "x", note: "y" });
    assert.equal(store.close(post.id, "p2"), false);
    assert.equal(store.close(post.id, "p1"), true);
    assert.equal(store.list()[0].status, "closed");
  });

  it("rejects joining closed or own posts", () => {
    const store = createLfgStore();
    const post = store.create({ playerId: "p1", region: "Australia (AU)", mode: "pvp", title: "x", note: "y" });
    assert.equal(store.join(post.id, "p1").ok, false);
    store.close(post.id, "p1");
    assert.equal(store.join(post.id, "p2").ok, false);
  });

  it("allows joining an open post", () => {
    const store = createLfgStore();
    const post = store.create({ playerId: "p1", region: "Australia (AU)", mode: "pvp", title: "x", note: "y" });
    const result = store.join(post.id, "p2");
    assert.equal(result.ok, true);
  });
});

describe("vanta ticket store", () => {
  it("creates tickets and resolves them", () => {
    const store = createTicketStore();
    const ticket = store.create({ playerId: "p1", category: "report", subject: "cheater", body: "details" });
    assert.equal(ticket.status, "open");
    assert.equal(store.list().length, 1);
    assert.equal(store.resolve(ticket.id), true);
    assert.equal(store.list()[0].status, "resolved");
  });

  it("returns false when resolving unknown ticket", () => {
    const store = createTicketStore();
    assert.equal(store.resolve("nope"), false);
  });
});
