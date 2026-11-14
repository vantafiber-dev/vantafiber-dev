import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createEventStore } from "./events.ts";

describe("vanta event store", () => {
  it("lists seeded events with the expected lifecycle states", () => {
    const store = createEventStore();
    const events = store.list();
    assert.equal(events.length, 2);
    assert.equal(events[0].id, "evt_season_zero_raid_clock");
    assert.equal(events[0].status, "open");
    assert.equal(events[1].id, "evt_founder_clash");
    assert.equal(events[1].status, "draft");
  });

  it("registers a player inside capacity", () => {
    const store = createEventStore();
    const result = store.register({ eventId: "evt_season_zero_raid_clock", playerId: "player_1" });
    assert.equal(result.ok, true);
    if (result.ok && result.registration) {
      assert.equal(result.registration.status, "registered");
      assert.equal(result.waitlisted, false);
    }
  });

  it("waitlists when capacity is exhausted", () => {
    const store = createEventStore();
    const event = store.get("evt_season_zero_raid_clock");
    assert.ok(event);
    if (!event) return;
    for (let i = 0; i < event.capacity; i += 1) {
      const r = store.register({ eventId: event.id, playerId: `player_${i}` });
      assert.equal(r.ok, true);
    }
    const overflow = store.register({ eventId: event.id, playerId: "player_overflow" });
    assert.equal(overflow.ok, true);
    if (overflow.ok && overflow.registration) assert.equal(overflow.waitlisted, true);
  });

  it("rejects duplicate registrations", () => {
    const store = createEventStore();
    assert.equal(store.register({ eventId: "evt_season_zero_raid_clock", playerId: "player_dup" }).ok, true);
    const second = store.register({ eventId: "evt_season_zero_raid_clock", playerId: "player_dup" });
    assert.equal(second.ok, false);
  });

  it("rejects registration for a draft event", () => {
    const store = createEventStore();
    const result = store.register({ eventId: "evt_founder_clash", playerId: "player_draft" });
    assert.equal(result.ok, false);
    const error = result.ok ? undefined : result.error;
    if (error) assert.match(error, /not open/i);
  });

  it("cancels a registration and frees the seat", () => {
    const store = createEventStore();
    assert.equal(store.register({ eventId: "evt_season_zero_raid_clock", playerId: "player_cancel" }).ok, true);
    store.cancel("evt_season_zero_raid_clock", "player_cancel");
    const afterCancel = store.register({ eventId: "evt_season_zero_raid_clock", playerId: "player_cancel" });
    assert.equal(afterCancel.ok, true);
    if (afterCancel.ok && afterCancel.registration) {
      assert.equal(afterCancel.registration.status, "registered");
    }
  });

  it("checks in a registered player and moves the event to in_progress", () => {
    const store = createEventStore();
    assert.equal(store.register({ eventId: "evt_season_zero_raid_clock", playerId: "player_check" }).ok, true);
    const check = store.checkIn("evt_season_zero_raid_clock", "player_check");
    assert.equal(check.ok, true);
    assert.equal(check.status, "checked_in");
    const ev = store.get("evt_season_zero_raid_clock");
    assert.equal(ev?.status, "in_progress");
  });

  it("rejects check-in for a waitlisted or unknown player", () => {
    const store = createEventStore();
    const badWait = store.checkIn("evt_season_zero_raid_clock", "player_never_registered");
    assert.equal(badWait.ok, false);
    const unknown = store.checkIn("evt_season_zero_raid_clock", "player_ghost");
    assert.equal(unknown.ok, false);
  });
});
