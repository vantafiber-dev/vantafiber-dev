# Vanta Fiber - Recovery

## Recovery principles

1. Restore the application database, configuration store and game saves as separate systems.
2. Restoring a world can duplicate rewards or invalidate delivery evidence; reconcile around the
   recovery point, do not blindly replay fulfilments after a game rollback.
3. A backup download or hash check alone is not a successful restore; run a controlled drill.

## Recovery drill

- Snapshot and hash current artefacts.
- Restore on disposable service where permitted.
- Suspend transfers/rewards as needed.
- Stage exact manifests per map.
- Verify config, credentials, scheduled jobs in UTC.
- Post-start checks before promoting the public season.

## Failure states

- One map fails during a season transition: apply rehearsed isolation policy; no false
  cluster-ready announcement.
- Provider timeout after write: mark effect unknown, inspect state, do not blind retry.
