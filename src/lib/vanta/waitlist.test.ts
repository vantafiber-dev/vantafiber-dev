import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  WAITLIST_PLATFORMS,
  createWaitlistStore,
  isValidEmail,
  isValidPlatform,
  type WaitlistInput,
  type WaitlistStorage,
} from "./waitlist.ts";

function memoryStorage(): WaitlistStorage & { map: Record<string, string> } {
  const map: Record<string, string> = {};
  return {
    map,
    getItem: (k: string) => (k in map ? (map[k] ?? null) : null),
    setItem: (k: string, v: string) => {
      map[k] = v;
    },
    removeItem: (k: string) => {
      delete map[k];
    },
  };
}

function makeInput(overrides: Partial<WaitlistInput> = {}): WaitlistInput {
  return {
    email: "player@example.com",
    platform: "xbox",
    region: "Australia (AU)",
    consent: { agreedToRules: true, optedInUpdates: false },
    ...overrides,
  };
}

describe("isValidEmail", () => {
  it("accepts a normal email", () => {
    assert.equal(isValidEmail("player@example.com"), true);
  });
  it("rejects a malformed email", () => {
    assert.equal(isValidEmail("not-an-email"), false);
    assert.equal(isValidEmail("missing@tld"), false);
    assert.equal(isValidEmail(""), false);
  });
});

describe("isValidPlatform", () => {
  it("accepts supported platforms only", () => {
    assert.equal(isValidPlatform("xbox"), true);
    assert.equal(isValidPlatform("windows-store"), true);
    assert.equal(isValidPlatform("steam"), false);
    assert.equal(isValidPlatform("playstation"), false);
  });
});

describe("waitlist store", () => {
  it("starts empty and accepts a valid entry", () => {
    const storage = memoryStorage();
    const store = createWaitlistStore(storage);
    assert.deepEqual(store.read(), []);

    const result = store.add(makeInput());
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.entry.email, "player@example.com");
      assert.equal(result.entry.platform, "xbox");
      assert.equal(result.entry.consent.agreedToRules, true);
    }
    assert.equal(store.read().length, 1);
  });

  it("rejects an email that is already registered", () => {
    const storage = memoryStorage();
    const store = createWaitlistStore(storage);
    assert.equal(store.add(makeInput()).ok, true);
    const second = store.add(makeInput());
    assert.equal(second.ok, false);
    if (!second.ok) assert.match(second.error, /already/i);
    assert.equal(store.read().length, 1);
  });

  it("requires consent before accepting", () => {
    const store = createWaitlistStore(memoryStorage());
    const result = store.add(
      makeInput({ consent: { agreedToRules: false, optedInUpdates: false } }),
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /agree/i);
  });

  it("requires a valid platform", () => {
    const store = createWaitlistStore(memoryStorage());
    const result = store.add(makeInput({ platform: "steam" as never }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /platform/i);
  });

  it("requires a region", () => {
    const store = createWaitlistStore(memoryStorage());
    const result = store.add(makeInput({ region: "  " }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /region/i);
  });

  it("clears stored entries", () => {
    const storage = memoryStorage();
    const store = createWaitlistStore(storage);
    assert.equal(store.add(makeInput()).ok, true);
    store.clear();
    assert.deepEqual(store.read(), []);
  });

  it("treats unreadable storage as empty", () => {
    const storage = {
      getItem: () => {
        throw new Error("boom");
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    const store = createWaitlistStore(storage);
    assert.deepEqual(store.read(), []);
  });

  it("lists the supported platform ids", () => {
    assert.deepEqual([...WAITLIST_PLATFORMS], ["xbox", "windows-store"]);
  });
});
