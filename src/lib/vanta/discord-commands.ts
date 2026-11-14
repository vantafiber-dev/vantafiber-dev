export type DiscordCommandFamily =
  | "player"
  | "community"
  | "moderation"
  | "server_ops"
  | "store_realm"
  | "owner_finance";

export type DiscordCommandStatus = "active" | "gated" | "manual" | "disabled";

export type DiscordCommand = {
  name: string;
  family: DiscordCommandFamily;
  summary: string;
  subcommands: string[];
  role: string;
  context: string;
  status: DiscordCommandStatus;
  featureFlag?: string;
};

export const DISCORD_COMMAND_FAMILIES: DiscordCommandFamily[] = [
  "player",
  "community",
  "moderation",
  "server_ops",
  "store_realm",
  "owner_finance",
];

export const DISCORD_COMMAND_STATUSES: DiscordCommandStatus[] = [
  "active",
  "gated",
  "manual",
  "disabled",
];

export const DISCORD_COMMANDS: DiscordCommand[] = [
  { name: "start", family: "player", summary: "Welcome onboarding entry", subcommands: [], role: "player", context: "member", status: "active" },
  { name: "help", family: "player", summary: "Command help", subcommands: [], role: "player", context: "member", status: "active" },
  { name: "rules", family: "player", summary: "Community rules", subcommands: [], role: "player", context: "member", status: "active" },
  { name: "maps", family: "player", summary: "Map status", subcommands: [], role: "player", context: "member", status: "active" },
  { name: "status", family: "player", summary: "Server status", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "server.status" },
  { name: "wipe", family: "player", summary: "Wipe calendar", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "season.briefing" },
  { name: "rates", family: "player", summary: "Rates summary", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "config.prototype" },
  { name: "join", family: "player", summary: "Join compass", subcommands: [], role: "player", context: "member", status: "active" },
  { name: "profile", family: "player", summary: "Player profile", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "identity.linking" },
  { name: "link", family: "player", summary: "Link Discord identity", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "identity.linking" },
  { name: "unlink", family: "player", summary: "Unlink Discord identity", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "identity.linking" },
  { name: "tribe", family: "player", summary: "Tribe management", subcommands: [], role: "tribe", context: "member", status: "gated", featureFlag: "tribe.portal" },
  { name: "lfg", family: "player", summary: "LFG create and join", subcommands: ["create", "join"], role: "player", context: "member", status: "gated", featureFlag: "lfg" },
  { name: "leaderboard", family: "player", summary: "Leaderboard", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "competitive.integrity" },
  { name: "events", family: "player", summary: "Event list and register", subcommands: ["register"], role: "player", context: "member", status: "gated", featureFlag: "events" },
  { name: "register", family: "player", summary: "Tribe registration", subcommands: [], role: "tribe", context: "member", status: "gated", featureFlag: "tribe.portal" },
  { name: "report", family: "player", summary: "File a report", subcommands: [], role: "player", context: "member", status: "active" },
  { name: "appeal", family: "player", summary: "Appeal a moderation action", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "appeals.human" },
  { name: "ticket", family: "player", summary: "Support ticket", subcommands: ["open", "close"], role: "player", context: "member", status: "gated", featureFlag: "support" },
  { name: "shop", family: "player", summary: "Shop info", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "wallet", family: "player", summary: "Wallet and credits", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "commerce.earned" },
  { name: "daily", family: "player", summary: "Daily engagement", subcommands: [], role: "player", context: "member", status: "disabled" },
  { name: "vote", family: "player", summary: "Community vote", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "community.votes" },
  { name: "rewards", family: "player", summary: "Rewards catalog", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "commerce.earned" },
  { name: "claim", family: "player", summary: "Claim reward", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "commerce.earned" },
  { name: "order", family: "player", summary: "Order placement", subcommands: [], role: "player", context: "member", status: "disabled", featureFlag: "commerce.gated" },
  { name: "transactions", family: "player", summary: "Transaction history", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "commerce.ledger" },
  { name: "support", family: "player", summary: "Support triage", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "support" },
  { name: "creator", family: "player", summary: "Creator tooling", subcommands: [], role: "creator", context: "member", status: "gated", featureFlag: "creators" },
  { name: "suggest", family: "player", summary: "Suggestions", subcommands: [], role: "player", context: "member", status: "active" },
  { name: "poll", family: "community", summary: "Community poll", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "community.votes" },
  { name: "event register", family: "community", summary: "Event registration", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "events" },
  { name: "event brackets", family: "community", summary: "Event brackets", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "events" },
  { name: "event score", family: "community", summary: "Event score", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "events" },
  { name: "season", family: "community", summary: "Season state", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "season.briefing" },
  { name: "referral link", family: "community", summary: "Referral link", subcommands: [], role: "player", context: "member", status: "disabled" },
  { name: "clips submit", family: "community", summary: "Clip submission", subcommands: [], role: "creator", context: "member", status: "gated", featureFlag: "creators" },
  { name: "creator apply", family: "community", summary: "Creator application", subcommands: [], role: "creator", context: "member", status: "gated", featureFlag: "creators" },
  { name: "partner apply", family: "community", summary: "Partner application", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "partners" },
  { name: "faq search", family: "community", summary: "FAQ search", subcommands: [], role: "player", context: "member", status: "manual" },
  { name: "translation", family: "community", summary: "Translation request", subcommands: [], role: "player", context: "member", status: "manual" },
  { name: "warn", family: "moderation", summary: "Warn player", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "anti_cheat.human" },
  { name: "timeout", family: "moderation", summary: "Timeout player", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "anti_cheat.human" },
  { name: "case", family: "moderation", summary: "Open moderation case", subcommands: [], role: "staff", context: "member", status: "active" },
  { name: "case attach", family: "moderation", summary: "Attach evidence", subcommands: [], role: "staff", context: "member", status: "active" },
  { name: "report review", family: "moderation", summary: "Review submitted report", subcommands: [], role: "staff", context: "member", status: "active" },
  { name: "ban propose", family: "moderation", summary: "Propose ban", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "anti_cheat.human" },
  { name: "ban approve", family: "moderation", summary: "Approve ban", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "anti_cheat.human" },
  { name: "ban appeal", family: "moderation", summary: "Ban appeal", subcommands: [], role: "player", context: "member", status: "gated", featureFlag: "appeals.human" },
  { name: "logs search", family: "moderation", summary: "Search moderation logs", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "audit.logs" },
  { name: "staff duty", family: "moderation", summary: "Staff duty state", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "staff.ops" },
  { name: "staff-note", family: "moderation", summary: "Staff note", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "staff.ops" },
  { name: "quarantine", family: "moderation", summary: "Quarantine player", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "anti_cheat.human" },
  { name: "purge", family: "moderation", summary: "Bounded purge", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "moderation.bounded" },
  { name: "incident declare", family: "moderation", summary: "Declare incident", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "incidents" },
  { name: "cluster status", family: "server_ops", summary: "Cluster status", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "provider.nitrado.adapter" },
  { name: "server status", family: "server_ops", summary: "Server status", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "server.status" },
  { name: "server restart-request", family: "server_ops", summary: "Restart request", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "provider.nitrado.adapter" },
  { name: "server change-preview", family: "server_ops", summary: "Change preview", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "config.prototype" },
  { name: "server backups", family: "server_ops", summary: "Backups", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "provider.backups" },
  { name: "server config-diff", family: "server_ops", summary: "Config diff", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "config.prototype" },
  { name: "server rollback-request", family: "server_ops", summary: "Rollback request", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "provider.backups" },
  { name: "server logs", family: "server_ops", summary: "Server logs", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "provider.logs" },
  { name: "server ban-request", family: "server_ops", summary: "Ban request", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "anti_cheat.human" },
  { name: "server health", family: "server_ops", summary: "Server health", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "server.status" },
  { name: "server maintenance", family: "server_ops", summary: "Maintenance", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "provider.maintenance" },
  { name: "server action-history", family: "server_ops", summary: "Action history", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "audit.logs" },
  { name: "store catalog", family: "store_realm", summary: "Store catalog", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "store order", family: "store_realm", summary: "Store order", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "store fulfill", family: "store_realm", summary: "Store fulfill", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "store refund-request", family: "store_realm", summary: "Store refund request", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "realm availability", family: "store_realm", summary: "Realm availability", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "realm quote", family: "store_realm", summary: "Realm quote", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "realm request", family: "store_realm", summary: "Realm request", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "realm extend", family: "store_realm", summary: "Realm extend", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "realm cancel", family: "store_realm", summary: "Realm cancel", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "realm support", family: "store_realm", summary: "Realm support", subcommands: [], role: "staff", context: "member", status: "gated", featureFlag: "commerce.gated" },
  { name: "ops dashboard", family: "owner_finance", summary: "Ops dashboard", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "ops.dashboard" },
  { name: "ops integrations", family: "owner_finance", summary: "Ops integrations", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "ops.integrations" },
  { name: "ops queues", family: "owner_finance", summary: "Ops queues", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "ops.queues" },
  { name: "ops spend", family: "owner_finance", summary: "Ops spend", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "ops.spend" },
  { name: "ops runway", family: "owner_finance", summary: "Ops runway", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "ops.runway" },
  { name: "ops revenue", family: "owner_finance", summary: "Ops revenue", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "ops.revenue" },
  { name: "ops webhook", family: "owner_finance", summary: "Ops webhook", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "ops.webhook" },
  { name: "ops audit", family: "owner_finance", summary: "Ops audit", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "ops.audit" },
  { name: "growth campaign", family: "owner_finance", summary: "Growth campaign", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "growth.campaign" },
  { name: "growth leads", family: "owner_finance", summary: "Growth leads", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "growth.leads" },
  { name: "growth partners", family: "owner_finance", summary: "Growth partners", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "growth.partners" },
  { name: "growth creator-performance", family: "owner_finance", summary: "Creator performance", subcommands: [], role: "owner", context: "staff", status: "gated", featureFlag: "growth.creators" },
  { name: "health test", family: "owner_finance", summary: "Health test", subcommands: [], role: "owner", context: "staff", status: "manual" },
];

export function commandsForFamily(family: DiscordCommandFamily): DiscordCommand[] {
  return DISCORD_COMMANDS.filter((c) => c.family === family);
}

export function activeCommands(): DiscordCommand[] {
  return DISCORD_COMMANDS.filter((c) => c.status === "active");
}

export function isKnownCommand(name: string): boolean {
  return DISCORD_COMMANDS.some((c) => c.name === name);
}
