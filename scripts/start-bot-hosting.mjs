import { spawn } from "node:child_process";

const port = process.env.SERVER_PORT || process.env.PORT || "8080";
const host = "0.0.0.0";

console.log("[start] launching vite preview on", host, port);
const preview = spawn("node", ["node_modules/vite/bin/vite.js", "preview", "--host", host, "--port", port], {
  stdio: "inherit",
  env: { ...process.env, VITE_AUTH_ENABLED: process.env.VITE_AUTH_ENABLED ?? "false" },
});

const gateway = spawn("node", ["scripts/discord-gateway.mjs"], { stdio: "inherit", env: process.env });

function shutdown() { preview.kill(); gateway.kill(); process.exit(0); }
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
