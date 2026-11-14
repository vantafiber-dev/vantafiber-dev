# Vanta Fiber - Architecture

## Logical topology

Public Site + Member Portal + Staff Portal
  -> API / Edge Gateway
  -> Authentication and RBAC -> Discord Interactions
  -> Application Services (Economy, Community/CRM, Game Operations)
  -> Transactional Database
  -> Events / Job Queue
  -> Payments, Nitrado Adapter, Alerts/Reports
  -> Verified Xbox ASE services

## Current implementation slice

- Frontend: TanStack Start + React 19 + Tailwind CSS v4.
- Data: PGlite embedded Postgres with Neon fallback, Kysely dialect.
- Auth: Better Auth with gate integration, preview mode off for production by default.
- Domain logic: `src/lib/vanta` (brand, capabilities, waitlist, discord command registry).
- QA: `scripts/vanta-smoke.mjs` (desktop + mobile render, console errors, overflow).

## Compliance boundaries

- No fake player counts, fake launch dates, fake reviews, fake partnerships.
- No autonomous permanent bans, refunds, purchases, outreach, live settings or publication.
- No real-money payments until legal and platform gates pass.
