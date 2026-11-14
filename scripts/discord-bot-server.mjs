import http from "node:http";
import fs from "node:fs";
import { createPublicKey, verify as cryptoVerify } from "node:crypto";
import { setupPreview, setupApply, setupAudit } from "./discord-bot-lib.mjs";
import { isDbConfigured, migrate, query } from "./db.mjs";

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

const ownerCache = new Map();
async function isOwner(interaction) {
  const userId = interaction?.member?.user?.id ?? interaction?.user?.id;
  if (OWNER_ID && userId === OWNER_ID) return true;
  const guildId = interaction.guild_id;
  const now = Date.now();
  const cached = ownerCache.get(guildId);
  if (!cached || cached.expires < now) {
    try {
      const r = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, { headers: { Authorization: `Bot ${BOT_TOKEN}` } });
      if (!r.ok) return false;
      const g = await r.json();
      ownerCache.set(guildId, { id: g.owner_id, expires: now + 5 * 60 * 1000 });
    } catch { ownerCache.set(guildId, { id: null, expires: now + 60 * 1000 }); }
  }
  return ownerCache.get(guildId)?.id === userId;
}

function hasPerm(interaction, bit) {
  const perms = BigInt(interaction?.member?.permissions ?? "0");
  return (perms & bit) === bit || (perms & ADMIN) === ADMIN;
}

async function followup(token, content) {
  try {
    const r = await fetch(`https://discord.com/api/v10/webhooks/${APP_ID}/${token}/messages/@original`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!r.ok) console.error("[followup] failed", r.status);
  } catch (e) { console.error("[followup] error", e); }
}

async function persistTicket(guildId, userId, subject) {
  const id = "tkt_" + Date.now();
  if (isDbConfigured()) {
    await query("insert into vanta_tickets (id, guild_id, user_id, subject) values ($1,$2,$3,$4)", [id, guildId, userId, subject]);
  } else {
    const p = "/home/container/vanta-tickets.json";
    let arr = [];
    try { arr = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
    arr.push({ id, guildId, userId, subject, createdAt: new Date().toISOString(), status: "open" });
    fs.writeFileSync(p, JSON.stringify(arr));
  }
  return id;
}

async function persistReport(guildId, userId, subject) {
  const id = "rpt_" + Date.now();
  if (isDbConfigured()) {
    await query("insert into vanta_reports (id, guild_id, user_id, subject) values ($1,$2,$3,$4)", [id, guildId, userId, subject]);
  } else {
    const p = "/home/container/vanta-reports.json";
    let arr = [];
    try { arr = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
    arr.push({ id, guildId, userId, subject, createdAt: new Date().toISOString() });
    fs.writeFileSync(p, JSON.stringify(arr));
  }
  return id;
}


async function createJob(guildId, ownerId) {
  const id = "job_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  if (isDbConfigured()) {
    // prevent concurrent jobs
    const existing = await query("select id from vanta_setup_jobs where guild_id=$1 and status in ('pending','running')", [guildId]);
    if (existing.length > 0) throw new Error("A setup job is already in progress.");
    await query("insert into vanta_setup_jobs (id, guild_id, owner_id, status, expires_at) values ($1,$2,$3,'pending',$4)", [id, guildId, ownerId, expires]);
  } else {
    const path = "/home/container/vanta-setup-jobs.json";
    let arr = [];
    try { arr = JSON.parse(fs.readFileSync(path, "utf8")); } catch {}
    const active = arr.find((j) => j.guildId === guildId && (j.status === "pending" || j.status === "running"));
    if (active) throw new Error("A setup job is already in progress.");
    arr.push({ id, guildId, ownerId, status: "pending", expiresAt: expires, createdAt: new Date().toISOString() });
    fs.writeFileSync(path, JSON.stringify(arr));
  }
  return { id, expires };
}

async function getJob(jobId) {
  if (isDbConfigured()) {
    const rows = await query("select * from vanta_setup_jobs where id=$1", [jobId]);
    return rows[0] ?? null;
  }
  const path = "/home/container/vanta-setup-jobs.json";
  let arr = [];
  try { arr = JSON.parse(fs.readFileSync(path, "utf8")); } catch {}
  return arr.find((j) => j.id === jobId) ?? null;
}

async function updateJob(jobId, status, result) {
  if (isDbConfigured()) {
    await query("update vanta_setup_jobs set status=$2, result=$3, updated_at=now() where id=$1", [jobId, status, result ?? null]);
  } else {
    const path = "/home/container/vanta-setup-jobs.json";
    let arr = [];
    try { arr = JSON.parse(fs.readFileSync(path, "utf8")); } catch {}
    const j = arr.find((x) => x.id === jobId);
    if (j) { j.status = status; j.result = result; j.updatedAt = new Date().toISOString(); }
    fs.writeFileSync(path, JSON.stringify(arr));
  }
}

function isMod2(interaction) {
  const perms = BigInt(interaction?.member?.permissions ?? "0");
  const ADMIN = 1n << 3n;
  const MODERATE = 1n << 40n;
  return (perms & MODERATE) === MODERATE || (perms & ADMIN) === ADMIN;
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
      return { type: 4, data: { content: "Vanta Fiber � Season Zero. Discord bot: online. DB: " + (isDbConfigured() ? "configured" : "not configured") + ". ARK provider: manual (unverified). Platform: Xbox + Windows Microsoft Store ASE." } };
    case "join":
      return { type: 4, data: { content: "Join the waitlist at the Vanta Fiber website. Season Zero briefing, raid calendar and event invites before launch." } };
    case "report":
      return {
        type: 4,
        data: {
          content: "File a report:",
          components: [{
            type: 1,
            components: [{ type: 2, style: 4, label: "Report a Player", custom_id: "open_report_modal" }],
          }],
        },
      };
    case "ban":
      if (!isMod) return { type: 4, data: { content: "You are not authorized to use this command.", flags: 64 } };
      return { type: 4, data: { content: "Ban action requires confirmation via the website admin terminal. Discord ban not auto-applied." } };
    case "mute": {
      if (!isMod) return { type: 4, data: { content: "You are not authorized to use this command.", flags: 64 } };
      const targetId = interaction?.data?.options?.[0]?.value;
      if (!targetId) return { type: 4, data: { content: "Missing target user.", flags: 64 } };
      const durationOpt = interaction?.data?.options?.[1]?.value;
      const minutes = Math.min(Math.max(Number(durationOpt) || 10, 1), 10080);
      const reason = interaction?.data?.options?.[2]?.value ?? "No reason provided";
      const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${targetId}`, {
        method: "PATCH",
        headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json", "X-Audit-Log-Reason": encodeURIComponent(reason) },
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
        // confirmation via buttons
        let job;
        try { job = await createJob(guildId, userId); }
        catch (e) { return { type: 4, data: { content: "Cannot start setup: " + (e?.message ?? e), flags: 64 } }; }
        return {
          type: 4,
          data: {
            content: "Confirm setup apply? This will create missing channels/roles, AutoMod rules and welcome message. (expires in 5 min)",
            components: [{
              type: 1,
              components: [
                { type: 2, style: 3, label: "Confirm", custom_id: "setup_apply_confirm:" + job.id },
                { type: 2, style: 4, label: "Cancel", custom_id: "setup_apply_cancel:" + job.id },
              ],
            }],
          },
        };
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
          try {
            const results = await setupApply(BOT_TOKEN, guildId);
            const created = results.filter((r) => r.status === "created").length;
            const r = await fetch(`https://discord.com/api/v10/webhooks/${APP_ID}/${token}/messages/@original`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: "Repair complete: " + created + " items created/repaired." }) });
            if (!r.ok) console.error("[repair] followup failed", r.status);
          } catch (e) {
            console.error("[repair] failed", e);
            await followup(token, "Repair failed: " + (e?.message ?? e));
          }
        })();
        return { type: 5 };
      }
      return { type: 4, data: { content: "Unknown setup subcommand." } };
    }
    case "vanta": {
      if (!owner) return { type: 4, data: { content: "Owner access required.", flags: 64 } };
      const dbStatus = isDbConfigured() ? "configured" : "not configured";
      let jobInfo = "none";
      if (isDbConfigured()) {
        try { const rows = await query("select status, count(*)::int as c from vanta_setup_jobs group by status"); jobInfo = rows.map((r) => r.status + ":" + r.c).join(", ") || "none"; } catch {} 
      }
      return {
        type: 4,
        data: {
          content: "VANTA CORE � Owner Control Panel\nDB: " + dbStatus + "\nBot: online\nGateway: connected\n\nUse buttons below for quick actions.",
          components: [{
            type: 1,
            components: [
              { type: 2, style: 1, label: "Run Setup Audit", custom_id: "vanta_audit" },
              { type: 2, style: 2, label: "Setup Preview", custom_id: "vanta_preview" },
            ],
          }],
        },
      };
    }
    case "ticket":
      return {
        type: 4,
        data: {
          content: "Open a support ticket:",
          components: [{
            type: 1,
            components: [{ type: 2, style: 1, label: "Open Ticket", custom_id: "open_ticket_modal" }],
          }],
        },
      };
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

async function handleComponent(interaction) {
  const customId = interaction?.data?.custom_id ?? "";
  const guildId = interaction.guild_id || GUILD_ID;
  const userId = interaction?.member?.user?.id ?? interaction?.user?.id ?? "unknown";
  const owner = await isOwner(interaction);

  if (customId.startsWith("setup_apply_confirm:")) {
    if (!owner) return { type: 4, data: { content: "Owner authorization required.", flags: 64 } };
    const jobId = customId.split(":")[1];
    const job = await getJob(jobId);
    if (!job) return { type: 4, data: { content: "Job not found.", flags: 64 } };
    if (job.owner_id !== userId && job.ownerId !== userId) return { type: 4, data: { content: "Not authorized for this job.", flags: 64 } };
    if (job.status !== "pending") return { type: 4, data: { content: "Job is not pending (status: " + job.status + ").", flags: 64 } };
    if (new Date(job.expires_at || job.expiresAt) < new Date()) return { type: 4, data: { content: "Confirmation expired.", flags: 64 } };
    if (job.guild_id !== guildId && job.guildId !== guildId) return { type: 4, data: { content: "Guild mismatch.", flags: 64 } };
    // atomic transition to running
    await updateJob(jobId, "running", null);
    const token = interaction.token;
    (async () => {
      try {
        const results = await setupApply(BOT_TOKEN, guildId);
        const created = results.filter((r) => r.status === "created").length;
        const existing = results.filter((r) => r.status === "exists").length;
        const errors = results.filter((r) => r.status.startsWith("error")).length;
        const am = results.filter((r) => r.type === "automod");
        await updateJob(jobId, "completed", created + " created");
        const r = await fetch(`https://discord.com/api/v10/webhooks/${APP_ID}/${token}/messages/@original`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "Setup apply complete: " + created + " created, " + existing + " already present, " + errors + " errors. AutoMod: " + am.map((r) => r.status).join(", ") + "." }),
        });
        if (!r.ok) console.error("[setup] followup failed", r.status);
      } catch (e) {
        console.error("[setup] apply failed", e);
        await updateJob(jobId, "failed", String(e?.message ?? e));
        await followup(token, "Setup apply failed: " + (e?.message ?? e));
      }
    })();
    return { type: 6 };
  }

  if (customId.startsWith("setup_apply_cancel:")) {
    if (!owner) return { type: 4, data: { content: "Owner authorization required.", flags: 64 } };
    const jobId = customId.split(":")[1];
    const job = await getJob(jobId);
    if (!job) return { type: 4, data: { content: "Job not found.", flags: 64 } };
    if (job.status !== "pending") return { type: 4, data: { content: "Job is not pending (status: " + job.status + ").", flags: 64 } };
    await updateJob(jobId, "cancelled", "cancelled by owner");
    return { type: 4, data: { content: "Setup cancelled." } };
  }

  if (customId === "vanta_audit") {
    if (!owner) return { type: 4, data: { content: "Owner access required.", flags: 64 } };
    const audit = await setupAudit(BOT_TOKEN, guildId);
    return { type: 4, data: { content: "Audit: " + audit.missingRoles.length + " missing roles, " + audit.missingChannels.length + " missing channels. Total roles: " + audit.totalRoles + ", channels: " + audit.totalChannels + "." } };
  }

  if (customId === "vanta_preview") {
    if (!owner) return { type: 4, data: { content: "Owner access required.", flags: 64 } };
    const preview = await setupPreview(BOT_TOKEN, guildId);
    return { type: 4, data: { content: "Setup preview: " + preview.rolesToCreate.length + " roles, " + preview.categoriesToCreate.length + " categories, " + preview.channelsToCreate.length + " channels to create. Already present: " + preview.alreadyPresent + "." } };
  }

  if (customId === "open_ticket_modal") {
    return {
      type: 9,
      data: {
        custom_id: "ticket_modal",
        title: "Open Support Ticket",
        components: [
          { type: 1, components: [{ type: 4, custom_id: "subject", label: "Subject", style: 1, required: true }] },
          { type: 1, components: [{ type: 4, custom_id: "category", label: "Category (general/report/appeal/purchase)", style: 1, required: true }] },
          { type: 1, components: [{ type: 4, custom_id: "description", label: "Description", style: 2, required: true }] },
        ],
      },
    };
  }
  if (customId === "open_report_modal") {
    return {
      type: 9,
      data: {
        custom_id: "report_modal",
        title: "Report a Player",
        components: [
          { type: 1, components: [{ type: 4, custom_id: "gamertag", label: "Xbox Gamertag", style: 1, required: true }] },
          { type: 1, components: [{ type: 4, custom_id: "behaviour", label: "Suspected behaviour", style: 2, required: true }] },
          { type: 1, components: [{ type: 4, custom_id: "time", label: "Approximate time", style: 1, required: false }] },
          { type: 1, components: [{ type: 4, custom_id: "evidence", label: "Evidence links", style: 2, required: false }] },
        ],
      },
    };
  }
  if (customId.startsWith("ticket_claim:")) {
    if (!isMod2(interaction)) return { type: 4, data: { content: "Moderator access required.", flags: 64 } };
    return { type: 4, data: { content: "Ticket claimed by <@" + userId + ">." } };
  }
  if (customId.startsWith("ticket_close:")) {
    if (!isMod2(interaction)) return { type: 4, data: { content: "Moderator access required.", flags: 64 } };
    const ticketId = customId.split(":")[1];
    if (isDbConfigured()) await query("update vanta_tickets set status='closed', updated_at=now() where id=$1", [ticketId]).catch(() => {});
    return { type: 4, data: { content: "Ticket " + ticketId + " closed." } };
  }
  if (customId === "role_member" || customId === "role_creator" || customId === "role_partner") {
    const roleName = customId === "role_member" ? "Member" : customId === "role_creator" ? "Creator" : "Partner";
    return { type: 4, data: { content: "Role '" + roleName + "' noted. Self-assignment requires server role configuration; request sent to staff.", flags: 64 } };
  }
  return { type: 4, data: { content: "Unknown component." } };
}


async function handleModal(interaction) {
  const customId = interaction?.data?.custom_id ?? "";
  const guildId = interaction.guild_id || GUILD_ID;
  const userId = interaction?.member?.user?.id ?? interaction?.user?.id ?? "unknown";
  const fields = interaction?.data?.components?.flatMap((r) => r.components ?? []) ?? [];
  const get = (id) => fields.find((f) => f.custom_id === id)?.value ?? "";

  if (customId === "ticket_modal") {
    const subject = get("subject") || "support";
    const description = get("description") || "";
    const category = get("category") || "general";
    const id = "tkt_" + Date.now();
    try {
      if (isDbConfigured()) {
        await query("insert into vanta_tickets (id, guild_id, user_id, subject, category) values ($1,$2,$3,$4,$5)", [id, guildId, userId, subject, category]);
      }
    } catch (e) { console.error("[ticket] db failed", e); }
    // Create private channel
    try {
      const { data: channels } = await (await fetch("https://discord.com/api/v10/guilds/" + guildId + "/channels", { headers: { Authorization: "Bot " + BOT_TOKEN } })).json();
      const supportCat = channels.find((c) => c.name === "SUPPORT" && c.type === 4);
      const body = { name: "ticket-" + id.slice(-6), type: 0, parent_id: supportCat?.id, topic: subject };
      const r = await fetch("https://discord.com/api/v10/guilds/" + guildId + "/channels", { method: "POST", headers: { Authorization: "Bot " + BOT_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) {
        const ch = await r.json();
        await fetch("https://discord.com/api/v10/channels/" + ch.id + "/messages", { method: "POST", headers: { Authorization: "Bot " + BOT_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify({ content: "Ticket " + id + "\nSubject: " + subject + "\nCategory: " + category + "\n\n" + description + "\n\nOpened by <@" + userId + ">" }) });
      }
    } catch (e) { console.error("[ticket] channel failed", e); }
    return { type: 4, data: { content: "Ticket opened (id " + id + "). A private channel has been created." }, flags: 64 };
  }

  if (customId === "report_modal") {
    const gamertag = get("gamertag") || "";
    const behaviour = get("behaviour") || "";
    const time = get("time") || "";
    const evidence = get("evidence") || "";
    const id = "rpt_" + Date.now();
    try {
      if (isDbConfigured()) {
        await query("insert into vanta_reports (id, guild_id, user_id, subject) values ($1,$2,$3,$4)", [id, guildId, userId, behaviour]);
      }
    } catch (e) { console.error("[report] db failed", e); }
    return { type: 4, data: { content: "Report recorded (id " + id + "). Evidence: " + (evidence || "none") + ". Staff will review." }, flags: 64 };
  }

  return { type: 4, data: { content: "Unknown modal." } };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    const data = JSON.stringify({ ok: true, service: "vanta-fiber-discord-bot", db: isDbConfigured() });
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
    if (interaction.type === 3) {
      const result = await handleComponent(interaction);
      return json(res, 200, result);
    }
    if (interaction.type === 5) {
      const result = await handleModal(interaction);
      return json(res, 200, result);
    }
    return json(res, 400, { error: "Unsupported interaction type" });
  }

  json(res, 404, { error: "Not found" });
});

// Run migrations on startup
migrate().then(() => {
  server.listen(Number(PORT), HOST, () => {
    console.log("[bot] listening on " + HOST + ":" + PORT);
  });
}).catch((e) => {
  console.error("[db] migration failed", e);
  server.listen(Number(PORT), HOST, () => {
    console.log("[bot] listening on " + HOST + ":" + PORT + " (no db)");
  });
});

server.on("error", (err) => {
  console.error("[bot] server error", err);
  process.exit(1);
});
