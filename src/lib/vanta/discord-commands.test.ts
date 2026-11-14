import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DISCORD_COMMANDS,
  DISCORD_COMMAND_FAMILIES,
  DISCORD_COMMAND_STATUSES,
  activeCommands,
  commandsForFamily,
  isKnownCommand,
} from "./discord-commands.ts";

describe("discord command registry", () => {
  it("covers every command family", () => {
    assert.deepEqual([...DISCORD_COMMAND_FAMILIES].sort(), [
      "community",
      "moderation",
      "owner_finance",
      "player",
      "server_ops",
      "store_realm",
    ].sort());
  });

  it("covers every declared status", () => {
    assert.deepEqual(
      [...DISCORD_COMMAND_STATUSES].sort(),
      ["active", "disabled", "gated", "manual"].sort(),
    );
  });

  it("registers the core player command families", () => {
    const player = commandsForFamily("player");
    assert.ok(player.some((c) => c.name === "join"));
    assert.ok(player.some((c) => c.name === "report"));
    assert.ok(player.some((c) => c.name === "appeal"));
    assert.ok(player.some((c) => c.name === "ticket"));
  });

  it("gates privileged commands behind feature flags", () => {
    const banned = DISCORD_COMMANDS.filter((c) => c.name === "ban approve");
    assert.equal(banned.length, 1);
    assert.equal(banned[0].status, "gated");
    assert.ok(banned[0].featureFlag);
  });

  it("marks unsafe commands disabled rather than silently enabled", () => {
    const order = DISCORD_COMMANDS.filter((c) => c.name === "order");
    assert.equal(order.length, 1);
    assert.equal(order[0].status, "disabled");
  });

  it("only exposes active commands through the public roster", () => {
    const active = activeCommands();
    assert.ok(active.length > 0);
    assert.equal(active.every((c) => c.status === "active"), true);
    for (const c of active) {
      assert.equal(isKnownCommand(c.name), true);
    }
  });
});
