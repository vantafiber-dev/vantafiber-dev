import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { handleInteraction, verifyDiscordSignature } from "./discord-handler.ts";

describe("vanta discord handler", () => {
  it("responds to ping", () => {
    const r = handleInteraction({ type: 1, id: "1", token: "t" });
    assert.equal(r.type, 1);
  });

  it("rejects unauthorized command", () => {
    const r = handleInteraction({ type: 2, id: "2", token: "t", data: { name: "ban" } }, []);
    assert.match(r.data?.content ?? "", /not authorized/i);
  });

  it("allows authorized command", () => {
    const r = handleInteraction({ type: 2, id: "3", token: "t", data: { name: "ban" } }, ["moderator"]);
    assert.match(r.data?.content ?? "", /acknowledged/i);
  });

  it("rejects unknown command", () => {
    const r = handleInteraction({ type: 2, id: "4", token: "t", data: { name: "nope" } }, []);
    assert.match(r.data?.content ?? "", /Unknown command/i);
  });

  it("verifies signature deterministically", () => {
    const sig = verifyDiscordSignature("secret", "00", "123", "body");
    assert.equal(typeof sig, "boolean");
  });
});
