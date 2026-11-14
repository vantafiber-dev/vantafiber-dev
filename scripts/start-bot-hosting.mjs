import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const port = process.env.SERVER_PORT || process.env.PORT || "8080";
const host = "0.0.0.0";

const viteBin = existsSync("node_modules/vite/bin/vite.js")
  ? "node_modules/vite/bin/vite.js"
  : null;

if (viteBin) {
  console.log("[start] launching vite preview on", host, port);
  const preview = spawn("node", [viteBin, "preview", "--host", host, "--port", port], {
    stdio: "inherit",
    env: { ...process.env, VITE_AUTH_ENABLED: process.env.VITE_AUTH_ENABLED ?? "false" },
  });
  process.on("SIGTERM", () => { preview.kill(); process.exit(0); });
  process.on("SIGINT", () => { preview.kill(); process.exit(0); });
} else {
  console.error("[start] vite not found. Run npm install first.");
}

if (process.env.DISCORD_BOT_TOKEN) {
  const gateway = spawn("node", ["scripts/discord-gateway.mjs"], { stdio: "inherit", env: process.env });
  process.on("SIGTERM", () => gateway.kill());
  process.on("SIGINT", () => gateway.kill());
} else {
  console.warn("[start] DISCORD_BOT_TOKEN missing; gateway worker not started.");
}
