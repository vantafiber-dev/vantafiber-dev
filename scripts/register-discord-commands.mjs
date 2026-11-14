import process from "node:process";

const token = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_CLIENT_ID ?? "1571074707053215824";
const guildId = process.env.DISCORD_GUILD_ID ?? "1571076052556582913";

if (!token) {
  console.error("Set DISCORD_BOT_TOKEN in the environment.");
  process.exit(1);
}

const commands = [
  { name: "status", description: "Show server status" },
  { name: "join", description: "Join waitlist info" },
  { name: "report", description: "File a report" },
  { name: "ban", description: "Ban a player (moderator)" },
  { name: "mute", description: "Mute a player (moderator)" },
];

const url = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;
const res = await fetch(url, {
  method: "PUT",
  headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(commands),
});
const data = await res.json();
console.log("Status:", res.status);
console.log(JSON.stringify(data, null, 2));
if (!res.ok) process.exit(1);
