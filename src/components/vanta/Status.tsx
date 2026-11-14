import { SiteChrome } from "./SiteChrome";
import { CAPABILITY_STATUS_LABELS, INITIAL_CAPABILITIES, type CapabilityStatus } from "@/lib/vanta/capabilities";

const STATUS_ORDER: CapabilityStatus[] = [
  "verified",
  "proven_sandbox",
  "requires_xbox_test",
  "requires_provider_approval",
  "manual_fallback",
  "unsupported",
  "prohibited",
];

export function Status() {
  return (
    <SiteChrome>
      <section aria-labelledby="status-board-title" className="py-14 md:py-20">
        <p className="kicker">Status board - capability truth matrix</p>
        <h2 id="status-board-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          What is verified, sandboxed, gated or unavailable
        </h2>
        <p className="mt-4 max-w-2xl text-base text-vanta-muted md:text-lg">
          Every automated action carries a capability status. Public status keeps planned,
          unknown, stale and confirmed outage states distinct. Uncertain live data degrades to
          read-only rather than optimistic status.
        </p>

        <div className="mt-8 grid gap-3">
          {INITIAL_CAPABILITIES.map((c) => (
            <article key={c.id} className="panel flex flex-col gap-2 p-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">{c.label}</h3>
                {c.detail ? <p className="mt-1 text-sm text-vanta-muted">{c.detail}</p> : null}
              </div>
              <p className="kicker" data-capability-status={c.status}>
                {CAPABILITY_STATUS_LABELS[c.status]}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="panel p-4">
              <p className="kicker">Capability state</p>
              <p className="mt-2 text-lg font-semibold">{CAPABILITY_STATUS_LABELS[s]}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
