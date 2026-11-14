import { createHmac, timingSafeEqual } from "node:crypto";

export type DiscordInteractionType = 1 | 2 | 3; // PING, APPLICATION_COMMAND, MESSAGE_COMPONENT

export type DiscordInteraction = {
  type: DiscordInteractionType;
  id: string;
  token: string;
  data?: { name?: string; options?: { name: string; value: unknown }[] };
  member?: { user: { id: string; username: string }; roles?: string[] };
  user?: { id: string; username: string };
};

export type HandlerResult = { type: number; data?: { content?: string; flags?: number } };

const COMMAND_ROLES: Record<string, string[]> = {
  ban: ["moderator", "admin"],
  mute: ["moderator", "admin"],
  wipe: ["admin"],
  config: ["admin"],
  status: [],
};

export function verifyDiscordSignature(publicKey: string, signature: string, timestamp: string, body: string): boolean {
  // Discord uses Ed25519; this helper provides HMAC fallback for testing/fixture validation.
  const hmac = createHmac("sha256", publicKey);
  hmac.update(timestamp + body);
  const expected = hmac.digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function handlePing(interaction: DiscordInteraction): HandlerResult {
  if (interaction.type === 1) return { type: 1 };
  return { type: 4, data: { content: "Unknown interaction." } };
}

export function handleCommand(interaction: DiscordInteraction, userRoles: string[]): HandlerResult {
  const name = interaction.data?.name ?? "";
  const required = COMMAND_ROLES[name];
  if (required === undefined) return { type: 4, data: { content: `Unknown command: ${name}` } };
  if (required.length > 0 && !required.some((r) => userRoles.includes(r))) {
    return { type: 4, data: { content: "You are not authorized to use this command.", flags: 64 } };
  }
  return { type: 4, data: { content: `Command ${name} acknowledged.` } };
}

export function handleInteraction(interaction: DiscordInteraction, userRoles: string[] = []): HandlerResult {
  if (interaction.type === 1) return handlePing(interaction);
  if (interaction.type === 2) return handleCommand(interaction, userRoles);
  return { type: 4, data: { content: "Unsupported interaction type." } };
}
