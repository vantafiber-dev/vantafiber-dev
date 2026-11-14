export type VantaConfigTemplate = {
  serverName: string;
  map: string;
  mode: "pve" | "pvp";
  difficulty: number;
  gatherMultiplier: number;
  xpMultiplier: number;
  tamingMultiplier: number;
  maxPlayers: number;
  crossplay: boolean;
  tribeSlots: number;
  dayCycleSpeed: number;
  nightCycleSpeed: number;
};

export type ConfigValidation = { ok: true } | { ok: false; errors: string[] };

export function validateConfig(t: VantaConfigTemplate): ConfigValidation {
  const errors: string[] = [];
  if (!t.serverName.trim()) errors.push("Server name is required.");
  if (!t.map.trim()) errors.push("Map is required.");
  if (t.difficulty < 0 || t.difficulty > 10) errors.push("Difficulty must be between 0 and 10.");
  if (t.gatherMultiplier <= 0) errors.push("Gather multiplier must be positive.");
  if (t.xpMultiplier <= 0) errors.push("XP multiplier must be positive.");
  if (t.tamingMultiplier <= 0) errors.push("Taming multiplier must be positive.");
  if (t.maxPlayers < 1 || t.maxPlayers > 70) errors.push("Max players must be between 1 and 70.");
  if (t.tribeSlots < 1) errors.push("Tribe slots must be at least 1.");
  if (t.dayCycleSpeed <= 0) errors.push("Day cycle speed must be positive.");
  if (t.nightCycleSpeed <= 0) errors.push("Night cycle speed must be positive.");
  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

export type CompiledConfig = {
  ini: string;
  checksum: string;
  warnings: string[];
};

function simpleChecksum(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function compileConfig(t: VantaConfigTemplate): CompiledConfig {
  const warnings: string[] = [];
  if (t.maxPlayers > 50) warnings.push("High player count may impact Xbox performance.");
  if (t.gatherMultiplier > 5) warnings.push("High gather multiplier may trivialize progression.");
  if (t.difficulty >= 8) warnings.push("High difficulty may frustrate new players.");

  const lines: string[] = [];
  lines.push("[ServerSettings]");
  lines.push(`ServerName=${t.serverName}`);
  lines.push(`MaxPlayers=${t.maxPlayers}`);
  lines.push(`ServerPVE=${t.mode === "pve" ? "True" : "False"}`);
  lines.push(`AllowCrossplay=${t.crossplay ? "True" : "False"}`);
  lines.push(`DifficultyOffset=${t.difficulty}`);
  lines.push(`XPMultiplier=${t.xpMultiplier}`);
  lines.push(`TamingSpeedMultiplier=${t.tamingMultiplier}`);
  lines.push(`HarvestAmountMultiplier=${t.gatherMultiplier}`);
  lines.push(`DayCycleSpeedScale=${t.dayCycleSpeed}`);
  lines.push(`NightTimeSpeedScale=${t.nightCycleSpeed}`);
  lines.push(`TribeSlots=${t.tribeSlots}`);
  lines.push("");
  lines.push("[SessionSettings]");
  lines.push(`SessionName=${t.serverName}`);
  lines.push(`MapName=${t.map}`);
  lines.push("");

  const ini = lines.join("\n");
  return { ini, checksum: simpleChecksum(ini), warnings };
}

export const defaultConfigTemplate: VantaConfigTemplate = {
  serverName: "Vanta Fiber - Season Zero",
  map: "TheIsland",
  mode: "pve",
  difficulty: 4,
  gatherMultiplier: 2,
  xpMultiplier: 2,
  tamingMultiplier: 3,
  maxPlayers: 40,
  crossplay: true,
  tribeSlots: 70,
  dayCycleSpeed: 1,
  nightCycleSpeed: 1,
};
