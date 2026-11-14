const token = process.env.DISCORD_BOT_TOKEN;
if (!token) { console.error("DISCORD_BOT_TOKEN required"); process.exit(1); }

const INTENTS = (1 << 0) | (1 << 1) | (1 << 9) | (1 << 15);
let seq = null;
let heartbeatInterval = null;

function connect() {
  const ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
  ws.addEventListener("open", () => console.log("[gateway] connected"));
  ws.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.s !== null) seq = payload.s;
    switch (payload.op) {
      case 10:
        heartbeatInterval = setInterval(() => ws.send(JSON.stringify({ op: 1, d: seq })), payload.d.heartbeat_interval);
        ws.send(JSON.stringify({ op: 2, d: { token, intents: INTENTS, properties: { os: "windows", browser: "vanta-fiber", device: "vanta-fiber" } } }));
        break;
      case 0:
        console.log(`[gateway] ${payload.t}`, payload.d?.id ?? payload.d?.guild_id ?? "");
        break;
      case 7:
        ws.close();
        break;
      case 9:
        setTimeout(connect, 5000);
        break;
    }
  });
  ws.addEventListener("close", () => { clearInterval(heartbeatInterval); setTimeout(connect, 5000); });
  ws.addEventListener("error", (e) => console.error("[gateway] error", e.message));
}

connect();
console.log("[gateway] starting");
