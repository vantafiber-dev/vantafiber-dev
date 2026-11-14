import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compileConfig, validateConfig, defaultConfigTemplate } from "./config-compiler.ts";

describe("vanta config compiler", () => {
  it("validates a good template", () => {
    const r = validateConfig(defaultConfigTemplate);
    assert.equal(r.ok, true);
  });

  it("rejects invalid values", () => {
    const r = validateConfig({ ...defaultConfigTemplate, maxPlayers: 0, gatherMultiplier: 0 });
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.ok(r.errors.length >= 2);
    }
  });

  it("compiles ini with server settings", () => {
    const c = compileConfig(defaultConfigTemplate);
    assert.match(c.ini, /ServerName=Vanta Fiber - Season Zero/);
    assert.match(c.ini, /MapName=TheIsland/);
    assert.match(c.ini, /ServerPVE=True/);
    assert.ok(c.checksum.length === 8);
  });

  it("emits warnings for extreme values", () => {
    const c = compileConfig({ ...defaultConfigTemplate, maxPlayers: 70, gatherMultiplier: 10, difficulty: 9 });
    assert.ok(c.warnings.length >= 3);
  });
});
