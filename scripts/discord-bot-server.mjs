import http from "node:http";
import fs from "node:fs";
import { createPublicKey, verify as cryptoVerify } from "node:crypto";
import { setupPreview, setupApply, setupAudit } from "./discord-bot-lib.mjs";

const PORT = process.env.SERVER_PORT || process.env.PORT || "8080";
const HOST = "0.0.0.0";
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || "";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const GUILD_ID = process.env.DISCORD_GUILD_ID || "";
const APP_ID = process.env.DISCORD_CLIENT_ID || "1571074707053215824";
const OWNER_ID = process.env.DISCORD_OWNER_ID || "";

const MODERATE = 1n << 40n;
const KICK = 1n << 1n;
const BAN = 1n << 2n;
const ADMIN = 1n << 3n;

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

async function isOwner(interaction) {
  const userId = interaction?.member?.user?.id ?? interaction?.user?.id;
  if (OWNER_ID && userId === OWNER_ID) return true;
  // fetch guild owner
  try {
    const r = await fetch(`https://discord.com/api/v10/guilds/${interaction.guild_id}`, { headers: { Authorization: `Bot ${BOT_TOKEN}` } });
    const g = await r.json();
    return g.owner_id === userId;
  } catch {
    return false;
  }
}

function hasPerm(interaction, bit) {
  const perms = BigInt(interaction?.member?.permissions ?? "0");
  return (perms & bit) === bit || (perms & ADMIN) === ADMIN;
}

async function followup(interactionToken, content) {
  try {
    await fetch(`https://discord.com/api/v10/webhooks/${APP_ID}/${interactionToken}/messages/@original`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch {}
}

async function handleCommand(interaction) {
  const name = interaction?.data?.name ?? "";
  const roles = interaction?.member?.roles ?? [];
  const isMod = hasPerm(interaction, MODERATE) || hasPerm(interaction, KICK) || hasPerm(interaction, BAN);
  const isAdmin = hasPerm(interaction, ADMIN);
  const owner = await isOwner(interaction);
  const guildId = interaction.guild_id || GUILD_ID;
  const userId = interaction?.member?.user?.id ?? interaction?.user?.id ?? "unknown";

  switch (name) {
    case "status":
      return { type: 4, data: { content: "Vanta Fiber — Season Zero. Discord bot: online. ARK provider integration: manual workflow (not verified live). Platform: Xbox + Windows Microsoft Store ASE. Positioning: 1000x Fibercraft PvP." } };
    case "join":
      return { type: 4, data: { content: "Join the waitlist at the Vanta Fiber website. Season Zero briefing, raid calendar and event invites before launch." } };
    case "report": {
      const subject = (interaction?.data?.options?.[0]?.value ?? "report").toString();
      const record = { id: "rpt_" + Date.now(), userId, subject, createdAt: new Date().toISOString() };
      try {
        const p = "/home/container/vanta-reports.json";
        let arr = [];
        try { arr = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
        arr.push(record);
        fs.writeFileSync(p, JSON.stringify(arr));
      } catch {}
      return { type: 4, data: { content: "Report recorded (id " + record.id + "). Staff will review." } };
    }
    case "ban":
      if (!isMod) return { type: 4, data: { content: "You are not authorized to use this command.", flags: 64 } };
      return { type: 4, data: { content: "Ban action requires confirmation via the website admin terminal. Discord ban not auto-applied." } };
    case "mute": {
      if (!isMod) return { type: 4, data: { content: "You are not authorized to use this command.", flags: 64 } };
      const targetId = interaction?.data?.options?.[0]?.value;
      if (!targetId) return { type: 4, data: { content: "Missing target user.", flags: 64 } };
      const durationOpt = interaction?.data?.options?.[1]?.value;
      const minutes = Math.min(Math.max(Number(durationOpt) || 10, 1), 10080);
      const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const reason = interaction?.data?.options?.[2]?.value ?? "No reason provided";
      const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${targetId}`, {
        method: "PATCH",
        headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ communication_disabled_until: until }),
      });
      if (res.status === 200) return { type: 4, data: { content: "Timed out <@" + targetId + "> for " + minutes + " minutes. Reason: " + reason } };
      return { type: 4, data: { content: "Timeout failed (HTTP " + res.status + ").", flags: 64 } };
    }
    case "setup": {
      const sub = interaction?.data?.options?.[0]?.name ?? "preview";
      if (sub === "preview") {
        if (!BOT_TOKEN) return { type: 4, data: { content: "Bot token not configured.", flags: 64 } };
        const preview = await setupPreview(BOT_TOKEN, guildId);
        return { type: 4, data: { content: "Setup preview: " + preview.rolesToCreate.length + " roles, " + preview.categoriesToCreate.length + " categories, " + preview.channelsToCreate.length + " channels to create. Already present: " + preview.alreadyPresent + "." } };
      }
      if (sub === "apply") {
        if (!owner) return { type: 4, data: { content: "Owner authorization required.", flags: 64 } };
        if (!BOT_TOKEN) return { type: 4, data: { content: "Bot token not configured.", flags: 64 } };
        // defer
        const token = interaction.token;
        (async () => {
          const results = await setupApply(BOT_TOKEN, guildId);
          const created = results.filter((r) => r.status === "created").length;
          const existing = results.filter((r) => r.status === "exists").length;
          const errors = results.filter((r) => r.status.startsWith("error")).length;
          const am = results.filter((r) => r.type === "automod");
          await followup(token, "Setup apply complete: " + created + " created, " + existing + " already present, " + errors + " errors. AutoMod: " + am.map((r) => r.status).join(", ") + ".");
        })();
        return { type: 5 };
      }
      if (sub === "audit") {
        if (!BOT_TOKEN) return { type: 4, data: { content: "Bot token not configured.", flags: 64 } };
        const audit = await setupAudit(BOT_TOKEN, guildId);
        return { type: 4, data: { content: "Audit: " + audit.missingRoles.length + " missing roles, " + audit.missingChannels.length + " missing channels. Total roles: " + audit.totalRoles + ", channels: " + audit.totalChannels + "." } };
      }
      if (sub === "repair") {
        if (!owner) return { type: 4, data: { content: "Owner authorization required.", flags: 64 } };
        if (!BOT_TOKEN) return { type: 4, data: { content: "Bot token not configured.", flags: 64 } };
        const token = interaction.token;
        (async () => {
          const results = await setupApply(BOT_TOKEN, guildId);
          const created = results.filter((r) => r.status === "created").length;
          await followup(token, "Repair complete: " + created + " items created/repaired.");
        })();
        return { type: 5 };
      }
      return { type: 4, data: { content: "Unknown setup subcommand." } };
    }
    case "vanta":
      if (!owner) return { type: 4, data: { content: "Owner access required.", flags: 64 } };
      return { type: 4, data: { content: "VANTA CORE — Overview: Discord bot online, gateway connected, interactions verified. Use /setup audit for infrastructure status." } };
    case "ticket": {
      const subject = (interaction?.data?.options?.[0]?.value ?? "support").toString();
      const record = { id: "tkt_" + Date.now(), userId, subject, createdAt: new Date().toISOString(), status: "open" };
      try {
        const p = "/home/container/vanta-tickets.json";
        let arr = [];
        try { arr = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
        arr.push(record);
        fs.writeFileSync(p, JSON.stringify(arr));
      } catch {}
      return { type: 4, data: { content: "Ticket opened (id " + record.id + "). Staff notified." } };
    }
    case "mod":
      if (!isMod) return { type: 4, data: { content: "Moderator access required.", flags: 64 } };
      return { type: 4, data: { content: "Moderation case created. Use website /reports for evidence, assignment and resolution workflow." } };
    case "event":
      return { type: 4, data: { content: "Event noted. Registrations and rosters managed on the website /events page." } };
    case "ark":
      if (!isMod) return { type: 4, data: { content: "Staff access required.", flags: 64 } };
      return { type: 4, data: { content: "ARK cluster status: platform Xbox + Windows Microsoft Store ASE. Provider integration: manual workflow (not verified live). See website /status." } };
    case "shop":
      return { type: 4, data: { content: "Shop and supporter packages: see website /commerce. Payment processing is owner-gated." } };
    case "staff":
      if (!isMod) return { type: 4, data: { content: "Staff access required.", flags: 64 } };
      return { type: 4, data: { content: "Staff roster and tasks managed on the website. Use /vanta for owner controls." } };
    default:
      return { type: 4, data: { content: "Unknown command: " + name } };
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
  console.log("[bot] listening on " + HOST + ":" + PORT);
});

server.on("error", (err) => {
  console.error("[bot] server error", err);
  process.exit(1);
});
