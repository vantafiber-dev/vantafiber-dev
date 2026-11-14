# Vanta Fiber — Decision Register

## D-2026-11-14-001

- Decision: Treat the App Builder sandbox as the canonical Vanta Fiber source repo until the
  owner supplies a dedicated repository.
- Rationale: working repository conventions exist; no destructive rewrite requested.
- Disposition: committed for the Phase 0 slice; revisit when owner opens a dedicated repo.

## D-2026-11-14-002

- Decision: Keep auth + database OFF for the public site; use localStorage fixture stores with
  explicit consent capture.
- Rationale: no accounts requirement for prelaunch waitlist; platform policy risk on paid features.
- Disposition: committed.

## D-2026-11-14-003

- Decision: Keep hosted checkout and live ban enforcement disabled pending legal/platform review.

- Rationale: Microsoft/Xbox Services Agreement, Wildcard, Nitrado and Discord policy gates.
- Disposition: committed (fail-closed).

## Open decisions

- None blocking Phase 0. Owner decisions still required before any spend, publish or live mutation.
