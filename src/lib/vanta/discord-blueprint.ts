export type BlueprintRole = { key: string; name: string; color: number; hoist: boolean; mentionable: boolean; permissions: string[]; managed: boolean };

export type BlueprintChannel = { key: string; name: string; type: "text" | "voice" | "forum" | "category"; parent?: string; topic?: string; slowmode?: number };

export const BLUEPRINT_VERSION = "1.0.0";

export const ROLES: BlueprintRole[] = [
  { key: "owner", name: "Owner", color: 0xff0000, hoist: true, mentionable: false, permissions: ["Administrator"], managed: false },
  { key: "operations", name: "Operations", color: 0xff8800, hoist: true, mentionable: true, permissions: ["ManageChannels", "ManageRoles", "KickMembers", "BanMembers"], managed: true },
  { key: "moderator", name: "Moderator", color: 0x00aaff, hoist: true, mentionable: true, permissions: ["KickMembers", "BanMembers", "ModerateMembers", "ManageMessages"], managed: true },
  { key: "trial_mod", name: "Trial Moderator", color: 0x0088cc, hoist: true, mentionable: true, permissions: ["ModerateMembers", "ManageMessages"], managed: true },
  { key: "event_host", name: "Event Host", color: 0x00ff88, hoist: true, mentionable: true, permissions: ["ManageEvents"], managed: true },
  { key: "creator", name: "Creator", color: 0xff00ff, hoist: true, mentionable: true, permissions: [], managed: true },
  { key: "partner", name: "Partner", color: 0xffff00, hoist: true, mentionable: true, permissions: [], managed: true },
  { key: "member", name: "Member", color: 0x888888, hoist: false, mentionable: false, permissions: [], managed: true },
  { key: "restricted", name: "Restricted", color: 0x444444, hoist: false, mentionable: false, permissions: [], managed: true },
];

export const CATEGORIES = [
  { key: "start", name: "START HERE" },
  { key: "cluster", name: "CLUSTER" },
  { key: "community", name: "COMMUNITY" },
  { key: "support", name: "SUPPORT" },
  { key: "creators", name: "CREATORS" },
  { key: "voice", name: "VOICE" },
  { key: "staff", name: "STAFF (PRIVATE)" },
  { key: "owner", name: "OWNER (RESTRICTED)" },
];

export const CHANNELS: BlueprintChannel[] = [
  { key: "welcome", name: "welcome", type: "text", parent: "start", topic: "Welcome to Vanta Fiber." },
  { key: "rules", name: "rules", type: "text", parent: "start", topic: "Community rules and policies." },
  { key: "choose_roles", name: "choose-your-roles", type: "text", parent: "start", topic: "Self-service role selection." },
  { key: "how_to_join", name: "how-to-join", type: "text", parent: "start", topic: "How to join Xbox/Windows ASE." },
  { key: "announcements", name: "announcements", type: "text", parent: "start", topic: "Official announcements." },
  { key: "server_status", name: "server-status", type: "text", parent: "cluster", topic: "Live server status." },
  { key: "rates", name: "rates-and-settings", type: "text", parent: "cluster", topic: "Server rates and settings." },
  { key: "wipe_calendar", name: "wipe-calendar", type: "text", parent: "cluster", topic: "Wipe schedule." },
  { key: "changes", name: "changes-and-known-issues", type: "text", parent: "cluster", topic: "Changelog and known issues." },
  { key: "the_purge", name: "the-purge", type: "text", parent: "cluster", topic: "The Purge finale event." },
  { key: "general", name: "general", type: "text", parent: "community", topic: "General chat." },
  { key: "tribe_recruitment", name: "tribe-recruitment", type: "text", parent: "community", topic: "Tribe recruitment." },
  { key: "clips", name: "clips-and-builds", type: "text", parent: "community", topic: "Clips and builds." },
  { key: "suggestions", name: "suggestions", type: "text", parent: "community", topic: "Suggestions." },
  { key: "events", name: "events", type: "text", parent: "community", topic: "Events." },
  { key: "open_ticket", name: "open-a-ticket", type: "text", parent: "support", topic: "Open a support ticket." },
  { key: "report_player", name: "report-a-player", type: "text", parent: "support", topic: "Report a player." },
  { key: "appeal", name: "appeal-a-decision", type: "text", parent: "support", topic: "Appeal a decision." },
  { key: "creator_hub", name: "creator-hub", type: "text", parent: "creators", topic: "Creator hub." },
  { key: "partner_info", name: "partner-information", type: "text", parent: "creators", topic: "Partner information." },
  { key: "lobby", name: "Lobby", type: "voice", parent: "voice" },
  { key: "squad_one", name: "Squad One", type: "voice", parent: "voice" },
  { key: "squad_two", name: "Squad Two", type: "voice", parent: "voice" },
  { key: "event_room", name: "Event Room", type: "voice", parent: "voice" },
  { key: "staff_chat", name: "staff-chat", type: "text", parent: "staff", topic: "Staff chat." },
  { key: "mod_alerts", name: "moderation-alerts", type: "text", parent: "staff", topic: "Moderation alerts." },
  { key: "case_queue", name: "case-queue", type: "text", parent: "staff", topic: "Case queue." },
  { key: "incident_room", name: "incident-room", type: "text", parent: "staff", topic: "Incident room." },
  { key: "audit_log", name: "audit-log", type: "text", parent: "staff", topic: "Audit log." },
  { key: "bot_health", name: "bot-health", type: "text", parent: "staff", topic: "Bot health." },
  { key: "security_alerts", name: "security-alerts", type: "text", parent: "owner", topic: "Security alerts." },
  { key: "deployment_status", name: "deployment-status", type: "text", parent: "owner", topic: "Deployment status." },
  { key: "campaign_approvals", name: "campaign-approvals", type: "text", parent: "owner", topic: "Campaign approvals." },
  { key: "config_changes", name: "configuration-changes", type: "text", parent: "owner", topic: "Configuration changes." },
];

export function blueprintSummary() {
  return { version: BLUEPRINT_VERSION, roles: ROLES.length, categories: CATEGORIES.length, channels: CHANNELS.length };
}
