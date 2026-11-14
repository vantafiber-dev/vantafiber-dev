# Vanta Fiber - Owner Setup

## Local

1. Clone or open the workspace at C:\Users\PlayNexus\app-builder-workspace.
2. Run `npm run dev`.
3. Verify `/`, `/join`, `/status`.

## Owner-gated setup

1. Discord developer application, bot token, guild install.
2. Nitrado Xbox ASE credentials via secrets management.
3. Payment provider credentials after legal gating.
4. Domain/TLS options.

## Commands that must actually run

- `npm run typecheck`
- `npm test`
- `node scripts/vanta-smoke.mjs`
- production build path via the Vite build step.

## Contact / brand email

- Primary contact email: vantafiber@gmail.com
- Password is NOT stored in the repository. Keep it in a password manager and rotate if shared anywhere.


## Social channels

- Instagram: https://www.instagram.com/vantafiber/

- Social account passwords are NOT stored in the repository; reuse the owner-managed password manager entry.


## Discord

- Account handle: vantafibercraft
- Email: vantafiber@gmail.com
- Password stored in owner password manager only (not in repo).


## Discord application (credentials provided by owner)

- Client ID: 1571074707053215824
- Client secret and bot token are NOT stored in the repository. Set them via environment variables (DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN) in the hosting secret store. Rotate them because they were shared in chat.


## Discord integration status (code ready, live pending)\n\n- Hosting: Vercel-style deploy (vercel.json present). Set env vars in the hosting dashboard: DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN, DISCORD_PUBLIC_KEY (interaction signature verification).\n- Interaction endpoint URL: https://<deployed-app>/api/discord/interactions (server route to be added).\n- Installation URL: https://discord.com/api/oauth2/authorize?client_id=1571074707053215824&scope=bot%20applications.commands&permissions=268435456\n- Required guild ID (non-secret) from owner to register commands in test guild.\n- Live OAuth login verification remains separate; callback URL config still required in Developer Portal.\n

- Discord public key (for interaction signature verification): 14dbf0f0e26a4afcdbe28618938d9d5f3bfa6a8d9e4f41e3e18400bbf7a9eb99


## Discord command registration

Run locally (token in env, never in repo):
$env:DISCORD_BOT_TOKEN="<token>"; $env:DISCORD_CLIENT_ID="1571074707053215824"; $env:DISCORD_GUILD_ID="1571076052556582913"; node scripts/register-discord-commands.mjs
Installation URL: https://discord.com/api/oauth2/authorize?client_id=1571074707053215824&scope=bot%20applications.commands&permissions=268435456

## Discord gateway worker

Gateway worker verified: connects, READY received, guild 1571076052556582913 loaded. Run with DISCORD_BOT_TOKEN in env.
