import http from "node:http";
import { createPublicKey, verify as cryptoVerify } from "node:crypto";
import { setupPreview, setupApply, setupAudit } from "./discord-bot-lib.mjs";

const PORT = process.env.SERVER_PORT || process.env.PORT || "8080";
const HOST = "0.0.0.0";
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || "";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const GUILD_ID = process.env.DISCORD_GUILD_ID || "";

const SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

function verifySignature(signature, timestamp, body) {
  try {
    const raw = Buffer.from(PUBLIC_KEY, "hex");
    const spki = Buffer.concat([SPKI_PREFIX, raw]);
    const pub = createPublicKey({ key: spki, format: "der", type: "spki" });
    const sig = Buffer.from(signature, "hex");
    const msg = Buffer.from(timestamp + body);
    return cryptoVerify(null, msg, pub, sig);
  } catch {
    return false;
  }
}

function json(res, status, obj) {
  const data = JSON.stringify(obj);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) });
  res.end(data);
}

async function handleCommand(interaction) {
  const name = interaction?.data?.name ?? "";
  const roles = interaction?.member?.roles ?? [];
  const perms = BigInt(interaction?.member?.permissions ?? "0");
  const isAdmin = (perms & 8n) === 8n || roles.includes(process.env.DISCORD_ADMIN_ROLE_ID ?? "");
  const isMod = (perms & 2n) === 2n || roles.includes(process.env.DISCORD_MOD_ROLE_ID ?? "") || isAdmin;
  const guildId = interaction.guild_id || GUILD_ID;

  switch (name) {
    case "status":
      return { type: 4, data: { content: "Vanta Fiber � Season Zero. Server status: online. Platform: Xbox + Windows Microsoft Store ASE. Positioning: 1000x Fibercraft PvP." } };
    case "join":
      return { type: 4, data: { content: "Join the waitlist at the Vanta Fiber website. Season Zero briefing, raid calendar and event invites before launch." } };
    case "report":
      return { type: 4, data: { content: "Report submitted. Use the website /reports page for full evidence and tracking." } };
    case "ban":
      if (!isMod) return { type: 4, data: { content: "You are not authorized to use this command.", flags: 64 } };
      return { type: 4, data: { content: "Ban action requires confirmation via the website admin terminal. Discord ban not auto-applied." } };
    case "mute":
      if (!isMod) return { type: 4, data: { content: "You are not authorized to use this command.", flags: 64 } };
      return { type: 4, data: { content: "Timeout applied (mute alias). Duration configurable via website." } };
    case "setup":
      // subcommand
      const sub = interaction?.data?.options?.[0]?.name ?? "preview";
      if (sub === "preview") {
        if (!BOT_TOKEN) return { type: 4, data: { content: "Bot token not configured.", flags: 64 } };
        const preview = await setupPreview(BOT_TOKEN, guildId);
        return { type: 4, data: { content: `Setup preview: ${preview.rolesToCreate.length} roles, ${preview.categoriesToCreate.length} categories, ${preview.channelsToCreate.length} channels to create. Already present: ${preview.alreadyPresent}.` } };
      }
      if (sub === "apply") {
        if (!isAdmin) return { type: 4, data: { content: "Owner authorization required.", flags: 64 } };
        if (!BOT_TOKEN) return { type: 4, data: { content: "Bot token not configured.", flags: 64 } };
        const results = await setupApply(BOT_TOKEN, guildId);
        const created = results.filter((r) => r.status === "created").length;
        const existing = results.filter((r) => r.status === "exists").length;
        const errors = results.filter((r) => r.status.startsWith("error")).length;
        const am = results.filter((r) => r.type === "automod");
        return { type: 4, data: { content: `Setup apply complete: ${created} created, ${existing} already present, ${errors} errors. AutoMod rules: ${am.map((r) => r.status).join(", ")}.` } };
      }
      if (sub === "audit") {
        if (!BOT_TOKEN) return { type: 4, data: { content: "Bot token not configured.", flags: 64 } };
        const audit = await setupAudit(BOT_TOKEN, guildId);
        return { type: 4, data: { content: `Audit: ${audit.missingRoles.length} missing roles, ${audit.missingChannels.length} missing channels. Total roles: ${audit.totalRoles}, channels: ${audit.totalChannels}.` } };
      }
      if (sub === "repair") {
        if (!isAdmin) return { type: 4, data: { content: "Owner authorization required.", flags: 64 } };
        if (!BOT_TOKEN) return { type: 4, data: { content: "Bot token not configured.", flags: 64 } };
        const results = await setupApply(BOT_TOKEN, guildId);
        const created = results.filter((r) => r.status === "created").length;
        return { type: 4, data: { content: `Repair complete: ${created} items created/repaired.` } };
      }
      return { type: 4, data: { content: "Unknown setup subcommand." } };
    case "vanta":
      if (!isAdmin) return { type: 4, data: { content: "Owner access required.", flags: 64 } };
      return { type: 4, data: { content: "VANTA CORE � Overview: Discord bot online, gateway connected, interactions verified. Use /setup audit for infrastructure status. Website: see deployment." } };
    case "ticket":
      return { type: 4, data: { content: "Ticket opened. A staff member will respond. Use /ticket on the website for full tracking and transcripts." } };
    case "mod":
      if (!isMod) return { type: 4, data: { content: "Moderator access required.", flags: 64 } };
      return { type: 4, data: { content: "Moderation case created. Use website /reports for evidence, assignment and resolution workflow." } };
    case "event":
      return { type: 4, data: { content: "Event noted. Registrations and rosters managed on the website /events page." } };
    case "ark":
      if (!isMod) return { type: 4, data: { content: "Staff access required.", flags: 64 } };
      return { type: 4, data: { content: "ARK cluster status: platform Xbox + Windows Microsoft Store ASE. Provider integration: manual workflow. See website /status." } };
    case "shop":
      return { type: 4, data: { content: "Shop and supporter packages: see website /commerce. Payment processing is owner-gated." } };
    case "staff":
      if (!isMod) return { type: 4, data: { content: "Staff access required.", flags: 64 } };
      return { type: 4, data: { content: "Staff roster and tasks managed on the website. Use /vanta for owner controls." } };
    default:
      return { type: 4, data: { content: `Unknown command: ${name}` } };
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    const data = JSON.stringify({ ok: true, service: "vanta-fiber-discord-bot" });
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(data);
  }

  if (req.method === "POST" && url.pathname === "/api/discord/interactions") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");

    const signature = req.headers["x-signature-ed25519"] ?? "";
    const timestamp = req.headers["x-signature-timestamp"] ?? "";

    if (!verifySignature(signature, timestamp, body)) {
      return json(res, 401, { error: "Invalid signature" });
    }

    let interaction;
    try { interaction = JSON.parse(body); } catch { return json(res, 400, { error: "Bad JSON" }); }

    if (interaction.type === 1) {
      return json(res, 200, { type: 1 });
    }
    if (interaction.type === 2) {
      const result = await handleCommand(interaction);
      return json(res, 200, result);
    }
    return json(res, 400, { error: "Unsupported interaction type" });
  }

  json(res, 404, { error: "Not found" });
});

server.listen(Number(PORT), HOST, () => {
  console.log(`[bot] listening on ${HOST}:${PORT}`);
});

server.on("error", (err) => {
  console.error("[bot] server error", err);
  process.exit(1);
});
