import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { verifyDiscordEd25519 } from "@/lib/vanta/discord-verify";
import { handleInteraction } from "@/lib/vanta/discord-handler";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/discord/interactions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const publicKey = env("DISCORD_PUBLIC_KEY") ?? "14dbf0f0e26a4afcdbe28618938d9d5f3bfa6a8d9e4f41e3e18400bbf7a9eb99";
        const signature = request.headers.get("x-signature-ed25519") ?? "";
        const timestamp = request.headers.get("x-signature-timestamp") ?? "";
        const body = await request.text();
        if (!verifyDiscordEd25519(publicKey, signature, timestamp, body)) {
          return json({ error: "Invalid signature" }, { status: 401 });
        }
        const interaction = JSON.parse(body);
        if (interaction.type === 1) {
          return json({ type: 1 });
        }
        const result = handleInteraction(interaction, []);
        return json(result);
      },
    },
  },
});
