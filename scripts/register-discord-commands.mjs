import process from "node:process";

const token = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_CLIENT_ID ?? "1571074707053215824";
const guildId = process.env.DISCORD_GUILD_ID ?? "1571076052556582913";

if (!token) { console.error("Set DISCORD_BOT_TOKEN"); process.exit(1); }

const commands = [
  { name: "status", description: "Show server status" },
  { name: "join", description: "Join waitlist info" },
  { name: "report", description: "File a report" },
  { name: "ban", description: "Ban a player (moderator)" },
  { name: "mute", description: "Mute a player (moderator)" },
  { name: "setup", description: "Server setup and audit", options: [
    { name: "preview", description: "Preview setup changes", type: 1 },
    { name: "apply", description: "Apply setup (owner only)", type: 1 },
    { name: "audit", description: "Audit current setup", type: 1 },
    { name: "repair", description: "Repair missing items (owner only)", type: 1 },
  ] },
  { name: "vanta", description: "Owner control center" },
  { name: "ticket", description: "Open a support ticket" },
  { name: "mod", description: "Moderation case (staff)" },
  { name: "event", description: "Event info and registration" },
  { name: "ark", description: "ARK cluster status (staff)" },
  { name: "shop", description: "Shop and supporter packages" },
  { name: "staff", description: "Staff roster and tasks" },
];

const url = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;
const res = await fetch(url, { method: "PUT", headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(commands) });
const data = await res.json();
console.log("Status:", res.status);
console.log("Commands:", (Array.isArray(data) ? data : [data]).map((c) => c.name).join(", "));
if (!res.ok) { console.error(JSON.stringify(data)); process.exit(1); }
