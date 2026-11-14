# Vanta Fiber - Platform Compatibility

## Invariant

Vanta Fiber targets ARK: Survival Evolved (ASE) on Xbox consoles plus the compatible
Windows Microsoft Store / Game Pass client. It does not target ARK: Survival Ascended, Steam,
Epic, or a PC-only server stack.

## Hard boundaries

1. No Steam-only or ASA-only path may ship as compatible.
2. No generic RCON or server-side plugin capability may be assumed for Nitrado Xbox hosting.
3. No claim that a QR code or any mechanism launches ASE or joins a server without a proven
   supported mechanism.
4. No claim of worldwide low latency from a single region.

## Source anchors

- Nitrado ASE Xbox product: https://server.nitrado.net/en-US/offers/ark-survival-evolved?platform=xbox
- Nitrado ASE FAQ: https://server.nitrado.net/eng/faqs/index/96/ark-survival-evolved
- ARK server configuration wiki: https://ark.wiki.gg/wiki/Server_configuration_(Survival_Evolved)
- Discord interaction lifecycle: https://github.com/discord/discord-api-docs/blob/main/developers/interactions/receiving-and-responding.mdx

## Acceptance

A first test server join path must be verified independently on Xbox and Windows Store clients
before any compatibility announcement.
