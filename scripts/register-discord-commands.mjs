import process from "node:process";

const token = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_CLIENT_ID ?? "1571074707053215824";
const guildId = process.env.DISCORD_GUILD_ID ?? "1571076052556582913";

if (!token) { console.error("Set DISCORD_BOT_TOKEN"); process.exit(1); }

const commands = [
  { name: "status", description: "Show server status" },
  { name: "join", description: "Join waitlist info" },
  { name: "report", description: "File a report", options: [ { name: "subject", description: "Report subject", type: 3, required: true } ] },
  { name: "ban", description: "Ban a player (moderator)", options: [ { name: "user", description: "Target user", type: 6, required: true } ] },
  { name: "mute", description: "Timeout a player (moderator)", options: [
    { name: "user", description: "Target user", type: 6, required: true },
    { name: "duration", description: "Duration in minutes (max 10080)", type: 4, required: false },
    { name: "reason", description: "Reason", type: 3, required: false },
  ] },
  { name: "setup", description: "Server setup and audit", options: [
    { name: "preview", description: "Preview setup changes", type: 1 },
    { name: "apply", description: "Apply setup (owner only)", type: 1 },
    { name: "audit", description: "Audit current setup", type: 1 },
    { name: "repair", description: "Repair missing items (owner only)", type: 1 },
  ] },
  { name: "vanta", description: "Owner control center" },
  { name: "ticket", description: "Open a support ticket", options: [ { name: "subject", description: "Ticket subject", type: 3, required: true } ] },
  { name: "mod", description: "Moderation case (staff)" },
  { name: "event", description: "Event info and registration" },
  { name: "ark", description: "ARK cluster status (staff)" },
  { name: "shop", description: "Shop and supporter packages" },
  { name: "staff", description: "Staff roster and tasks" },
  { name: "wipe", description: "Wipe management (owner)", options: [ { name: "status", description: "Wipe status", type: 1 }, { name: "schedule", description: "Schedule wipe", type: 1 } ] },
  { name: "case", description: "Create a moderation case (staff)", options: [ { name: "subject", description: "Case subject", type: 3, required: true } ] },
];

const url = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;
const res = await fetch(url, { method: "PUT", headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(commands) });
const data = await res.json();
console.log("Status:", res.status);
console.log("Commands:", (Array.isArray(data) ? data : [data]).map((c) => c.name).join(", "));
if (!res.ok) { console.error(JSON.stringify(data)); process.exit(1); }
