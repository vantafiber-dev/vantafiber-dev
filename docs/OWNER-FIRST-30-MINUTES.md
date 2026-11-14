# Vanta Fiber - Owner First 30 Minutes

Owner: PlayNexus
Purpose: fastest truthful path from a cold checkout to a working local Vanta Fiber preview.

## 0. First 10 minutes

1. Read `docs/STATUS-AND-TESTS.md` for current phase and evidence.
2. Read `docs/PLATFORM-COMPATIBILITY.md` for the Xbox/Microsoft Store ASE boundary.
3. Run the dev server: `npm run dev` (Vite on 0.0.0.0:8080).

## 10-20 minutes

4. Open `/` for the public landing slice.
5. Open `/join` for the Join Compass and waitlist fixture.
6. Open `/status` for the capability truth matrix.

## 20-30 minutes

7. Run verification:
   - `npm run typecheck`
   - `npm test`
   - `node scripts/vanta-smoke.mjs`
8. Record any failure in `docs/STATUS-AND-TESTS.md` before changing code.

## Owner-gated actions (no autonomous execution)

- Rent or spend on Xbox ASE hosting capacity.
- Connect Discord application credentials or run a bot deployment.
- Connect Nitrado provider credentials or run live API tests.
- Connect payment provider credentials or launch fundraising.
- Publish public communications or modify live servers.

None of the above may be performed by the build agent without explicit owner approval.
