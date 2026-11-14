import fs from "node:fs";

const API = "https://discord.com/api/v10";

export async function discordFetch(path, token, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

export const BLUEPRINT = {
  roles: [
    { name: "Vanta Owner", color: 0xff0000, hoist: true, permissions: "0" },
    { name: "Operations", color: 0xff8800, hoist: true, permissions: "0" },
    { name: "Moderator", color: 0x00aaff, hoist: true, permissions: "0" },
    { name: "Trial Moderator", color: 0x0088cc, hoist: true, permissions: "0" },
    { name: "Event Host", color: 0x00ff88, hoist: true, permissions: "0" },
    { name: "Creator", color: 0xff00ff, hoist: true, permissions: "0" },
    { name: "Partner", color: 0xffff00, hoist: true, permissions: "0" },
    { name: "Member", color: 0x888888, hoist: false, permissions: "0" },
    { name: "Restricted", color: 0x444444, hoist: false, permissions: "0" },
  ],
  categories: [
    { name: "START HERE" },
    { name: "CLUSTER" },
    { name: "COMMUNITY" },
    { name: "SUPPORT" },
    { name: "CREATORS" },
    { name: "VOICE" },
    { name: "STAFF (PRIVATE)" },
    { name: "OWNER (RESTRICTED)" },
  ],
  channels: [
    { name: "welcome", type: 0, category: "START HERE", topic: "Welcome to Vanta Fiber." },
    { name: "rules", type: 0, category: "START HERE", topic: "Community rules and policies." },
    { name: "choose-your-roles", type: 0, category: "START HERE", topic: "Self-service role selection." },
    { name: "how-to-join", type: 0, category: "START HERE", topic: "How to join Xbox/Windows ASE." },
    { name: "announcements", type: 0, category: "START HERE", topic: "Official announcements." },
    { name: "server-status", type: 0, category: "CLUSTER", topic: "Live server status." },
    { name: "rates-and-settings", type: 0, category: "CLUSTER", topic: "Server rates and settings." },
    { name: "wipe-calendar", type: 0, category: "CLUSTER", topic: "Wipe schedule." },
    { name: "changes-and-known-issues", type: 0, category: "CLUSTER", topic: "Changelog and known issues." },
    { name: "the-purge", type: 0, category: "CLUSTER", topic: "The Purge finale event." },
    { name: "general", type: 0, category: "COMMUNITY", topic: "General chat." },
    { name: "tribe-recruitment", type: 0, category: "COMMUNITY", topic: "Tribe recruitment." },
    { name: "clips-and-builds", type: 0, category: "COMMUNITY", topic: "Clips and builds." },
    { name: "suggestions", type: 0, category: "COMMUNITY", topic: "Suggestions." },
    { name: "events", type: 0, category: "COMMUNITY", topic: "Events." },
    { name: "open-a-ticket", type: 0, category: "SUPPORT", topic: "Open a support ticket." },
    { name: "report-a-player", type: 0, category: "SUPPORT", topic: "Report a player." },
    { name: "appeal-a-decision", type: 0, category: "SUPPORT", topic: "Appeal a decision." },
    { name: "creator-hub", type: 0, category: "CREATORS", topic: "Creator hub." },
    { name: "partner-information", type: 0, category: "CREATORS", topic: "Partner information." },
    { name: "Lobby", type: 2, category: "VOICE", topic: "Voice lobby." },
    { name: "Squad One", type: 2, category: "VOICE" },
    { name: "Squad Two", type: 2, category: "VOICE" },
    { name: "Event Room", type: 2, category: "VOICE" },
    { name: "staff-chat", type: 0, category: "STAFF (PRIVATE)", topic: "Staff chat." },
    { name: "moderation-alerts", type: 0, category: "STAFF (PRIVATE)", topic: "Moderation alerts." },
    { name: "case-queue", type: 0, category: "STAFF (PRIVATE)", topic: "Case queue." },
    { name: "incident-room", type: 0, category: "STAFF (PRIVATE)", topic: "Incident room." },
    { name: "audit-log", type: 0, category: "STAFF (PRIVATE)", topic: "Audit log." },
    { name: "bot-health", type: 0, category: "STAFF (PRIVATE)", topic: "Bot health." },
    { name: "security-alerts", type: 0, category: "OWNER (RESTRICTED)", topic: "Security alerts." },
    { name: "deployment-status", type: 0, category: "OWNER (RESTRICTED)", topic: "Deployment status." },
    { name: "campaign-approvals", type: 0, category: "OWNER (RESTRICTED)", topic: "Campaign approvals." },
    { name: "configuration-changes", type: 0, category: "OWNER (RESTRICTED)", topic: "Configuration changes." },
  ],
};

export async function setupPreview(token, guildId) {
  const { data: existingChannels } = await discordFetch(`/guilds/${guildId}/channels`, token);
  const { data: existingRoles } = await discordFetch(`/guilds/${guildId}/roles`, token);
  const existingChannelNames = new Set(existingChannels.map((c) => c.name));
  const existingRoleNames = new Set(existingRoles.map((r) => r.name));
  const toCreateRoles = BLUEPRINT.roles.filter((r) => !existingRoleNames.has(r.name));
  const toCreateCategories = BLUEPRINT.categories.filter((c) => !existingChannelNames.has(c.name));
  const toCreateChannels = BLUEPRINT.channels.filter((c) => !existingChannelNames.has(c.name));
  return {
    rolesToCreate: toCreateRoles.map((r) => r.name),
    categoriesToCreate: toCreateCategories.map((c) => c.name),
    channelsToCreate: toCreateChannels.map((c) => c.name),
    alreadyPresent: existingChannels.length + existingRoles.length,
  };
}

export async function setupApply(token, guildId) {
  const results = [];
  const { data: existingRoles } = await discordFetch(`/guilds/${guildId}/roles`, token);
  const roleMap = new Map(existingRoles.map((r) => [r.name, r.id]));
  for (const r of BLUEPRINT.roles) {
    if (roleMap.has(r.name)) { results.push({ type: "role", name: r.name, status: "exists" }); continue; }
    const res = await discordFetch(`/guilds/${guildId}/roles`, token, { method: "POST", body: JSON.stringify({ name: r.name, color: r.color, hoist: r.hoist, permissions: r.permissions }) });
    if (res.status === 200 || res.status === 201) { roleMap.set(r.name, res.data.id); results.push({ type: "role", name: r.name, status: "created" }); }
    else results.push({ type: "role", name: r.name, status: "error " + res.status });
  }
  const { data: existingChannels } = await discordFetch(`/guilds/${guildId}/channels`, token);
  const channelMap = new Map(existingChannels.map((c) => [c.name, c.id]));
  const categoryMap = new Map();
  for (const cat of BLUEPRINT.categories) {
    if (channelMap.has(cat.name)) { categoryMap.set(cat.name, channelMap.get(cat.name)); results.push({ type: "category", name: cat.name, status: "exists" }); continue; }
    const res = await discordFetch(`/guilds/${guildId}/channels`, token, { method: "POST", body: JSON.stringify({ name: cat.name, type: 4 }) });
    if (res.status === 200 || res.status === 201) { channelMap.set(cat.name, res.data.id); categoryMap.set(cat.name, res.data.id); results.push({ type: "category", name: cat.name, status: "created" }); }
    else results.push({ type: "category", name: cat.name, status: "error " + res.status });
  }
  for (const ch of BLUEPRINT.channels) {
    if (channelMap.has(ch.name)) { results.push({ type: "channel", name: ch.name, status: "exists" }); continue; }
    const payload = { name: ch.name, type: ch.type, topic: ch.topic };
    if (ch.category && categoryMap.has(ch.category)) payload.parent_id = categoryMap.get(ch.category);
    const res = await discordFetch(`/guilds/${guildId}/channels`, token, { method: "POST", body: JSON.stringify(payload) });
    if (res.status === 200 || res.status === 201) { channelMap.set(ch.name, res.data.id); results.push({ type: "channel", name: ch.name, status: "created" }); }
    else results.push({ type: "channel", name: ch.name, status: "error " + res.status + ": " + JSON.stringify(res.data).slice(0, 100) });
  }
  const privateCats = ["STAFF (PRIVATE)", "OWNER (RESTRICTED)"];
  for (const ch of BLUEPRINT.channels) {
    if (!privateCats.includes(ch.category)) continue;
    const cid = channelMap.get(ch.name);
    if (!cid) continue;
    const res = await discordFetch(`/channels/${cid}/permissions/${guildId}`, token, { method: "PUT", body: JSON.stringify({ type: 0, allow: "0", deny: "1024" }) });
    results.push({ type: "permission", name: ch.name, status: res.status === 204 || res.status === 200 ? "applied" : "error " + res.status });
  }
  const staffRoleNames = ["Operations", "Moderator", "Trial Moderator"];
  const { data: allRoles } = await discordFetch(`/guilds/${guildId}/roles`, token);
  const roleByName = new Map(allRoles.map((r) => [r.name, r.id]));
  for (const ch of BLUEPRINT.channels) {
    if (!privateCats.includes(ch.category)) continue;
    const cid = channelMap.get(ch.name);
    if (!cid) continue;
    for (const rn of staffRoleNames) {
      const rid = roleByName.get(rn);
      if (!rid) continue;
      await discordFetch(`/channels/${cid}/permissions/${rid}`, token, { method: "PUT", body: JSON.stringify({ type: 0, allow: "3072", deny: "0" }) });
    }
  }
  const am = await createAutoModRules(token, guildId);
  for (const r of am) results.push({ type: "automod", name: r.name, status: r.status });
  const w = await postWelcome(token, guildId, channelMap);
  results.push({ type: "welcome", name: "welcome message", status: w.status });
  try {
    const welcomeId = channelMap.get("welcome");
    if (welcomeId) {
      const { data: msgs } = await discordFetch(`/channels/${welcomeId}/messages?limit=10`, token);
      const existing = Array.isArray(msgs) ? msgs.find((m) => (m.content || "").includes("VANTA FIBER - WELCOME")) : null;
      if (existing) fs.writeFileSync("/home/container/vanta-welcome-id.txt", existing.id);
    }
  } catch (e) { console.error("[welcome] persist failed", e); }
  try { fs.writeFileSync("/home/container/vanta-setup-job.json", JSON.stringify({ status: "completed", at: new Date().toISOString(), created: results.filter((r) => r.status === "created").length })); } catch (e) { console.error("[setup] persist failed", e); }
  return results;
}

export async function setupAudit(token, guildId) {
  const { data: channels } = await discordFetch(`/guilds/${guildId}/channels`, token);
  const { data: roles } = await discordFetch(`/guilds/${guildId}/roles`, token);
  const channelNames = new Set(channels.map((c) => c.name));
  const roleNames = new Set(roles.map((r) => r.name));
  const missingChannels = BLUEPRINT.channels.filter((c) => !channelNames.has(c.name)).map((c) => c.name);
  const missingRoles = BLUEPRINT.roles.filter((r) => !roleNames.has(r.name)).map((r) => r.name);
  return { missingChannels, missingRoles, totalChannels: channels.length, totalRoles: roles.length };
}

export async function createAutoModRules(token, guildId) {
  const desired = [
    { name: "VF - Mention spam", event_type: 1, trigger_type: 5, trigger_metadata: { mention_total_limit: 5 }, actions: [{ type: 1 }], enabled: true },
    { name: "VF - Suspicious links", event_type: 1, trigger_type: 1, trigger_metadata: { keyword_filter: ["discord.gg/", "bit.ly/", "tinyurl.com/"] }, actions: [{ type: 1 }], enabled: true },
  ];
  const { data: existing } = await discordFetch(`/guilds/${guildId}/auto-moderation/rules`, token);
  const existingByName = new Map((Array.isArray(existing) ? existing : []).map((r) => [r.name, r.id]));
  const results = [];
  for (const r of desired) {
    if (existingByName.has(r.name)) { results.push({ name: r.name, status: "exists" }); continue; }
    const res = await discordFetch(`/guilds/${guildId}/auto-moderation/rules`, token, { method: "POST", body: JSON.stringify(r) });
    results.push({ name: r.name, status: res.status === 200 || res.status === 201 ? "created" : "error " + res.status });
  }
  return results;
}

export async function postWelcome(token, guildId, channelMap) {
  const welcomeId = channelMap.get("welcome");
  if (!welcomeId) return { status: "no welcome channel" };
  let storedId = null;
  try { storedId = fs.readFileSync("/home/container/vanta-welcome-id.txt", "utf8").trim(); } catch {}
  const content = "VANTA FIBER - WELCOME\n\nWelcome to Vanta Fiber: 1000x Fibercraft PvP on Xbox and Windows Microsoft Store ARK: Survival Evolved.\n\nRules, join instructions, role selection and support are in the channels below. Season Zero is live. Read announcements and wipe-calendar.\n\nNo fake counts, no pay-to-win. Fair play is enforced.";
  if (storedId) {
    const res = await discordFetch(`/channels/${welcomeId}/messages/${storedId}`, token, { method: "PATCH", body: JSON.stringify({ content }) });
    if (res.status === 200) return { status: "edited" };
  }
  const { data: msgs } = await discordFetch(`/channels/${welcomeId}/messages?limit=10`, token);
  const existing = Array.isArray(msgs) ? msgs.find((m) => (m.content || "").includes("VANTA FIBER - WELCOME")) : null;
  if (existing) {
    try { fs.writeFileSync("/home/container/vanta-welcome-id.txt", existing.id); } catch (e) { console.error("[welcome] persist failed", e); }
    const res = await discordFetch(`/channels/${welcomeId}/messages/${existing.id}`, token, { method: "PATCH", body: JSON.stringify({ content }) });
    return { status: res.status === 200 ? "edited" : "error " + res.status };
  }
  const res = await discordFetch(`/channels/${welcomeId}/messages`, token, { method: "POST", body: JSON.stringify({ content }) });
  if (res.status === 200 || res.status === 201) {
    try { fs.writeFileSync("/home/container/vanta-welcome-id.txt", res.data.id); } catch (e) { console.error("[welcome] persist failed", e); }
  }
  return { status: res.status === 200 || res.status === 201 ? "posted" : "error " + res.status };
}
