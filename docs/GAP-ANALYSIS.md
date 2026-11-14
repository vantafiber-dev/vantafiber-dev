# Vanta Fiber - Gap analysis vs master prompt

## Feasible (code) - DONE (reports now DB-backed)
- Landing/waitlist/status/seasons/fair-play/help/events/community/config/commerce/members/rehearsal/reports/anti-cheat/incidents routes with fixtures
- Domain modules: brand, waitlist, capabilities, discord-commands, events, community, config-compiler, providers, commerce, members, wipe-rehearsal, reports, anti-cheat, incidents, audit-log
- Tests: 118 pass; typecheck 0; vite build exit 0; smoke exit 0 (15 routes, desktop+mobile)

## Partial / docs only
- Research dossiers (market-landscape, competitor-matrix, etc.) not produced; only docs registers exist
- Discord server blueprint channels doc exists (DISCORD-CHANNELS.md) but no live bot
- Marketing/hype content not produced
- Owner/admin terminal, member portal auth (Discord OAuth), private realm terminal not built (fixture only)

## Blocked (owner-gated)
- Live Xbox ASE hosting, Nitrado creds, Discord app creds, payment creds, legal sign-off
- Real persistence (PGlite scaffold present but Vanta modules use in-memory fixtures)

## Test discovery note

- 
pm test runs 
ode --test 'scripts/**/*.test.mjs' first, which currently finds 0 test files (hence 'tests 0, pass 0, fail 0'), then runs the Vanta suites via --experimental-strip-types. The 'tests 0' line is not a failure; it is an empty glob segment. All 118 Vanta tests pass.


## Report workflow (DB-backed)

- Migration 0002_vanta.sql creates vanta_reports + vanta_audit.
- Server functions in src/lib/vanta/reports.functions.ts use getSql + authMiddleware.
- Reports.tsx calls server functions; success only after DB write.
- Auth disabled + PGLite (no DATABASE_URL) resolves dev user; fail-closed when DATABASE_URL set.

## DB-backed workflows (this pass)

- reports, incidents, anti-cheat, members, waitlist, events, commerce, community now use server functions + Postgres/PGLite tables (migration 0002_vanta.sql).
- Components call server functions; success only after DB write.
- Auth middleware derives userId from session; dev fallback when auth disabled + no DATABASE_URL.
