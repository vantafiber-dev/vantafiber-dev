import { SiteChrome } from "./SiteChrome";

const DETECTION_FAMILIES = [
  "Duplication and impossible inventory growth",
  "Mesh and base-geometry violations",
  "Unusual player stat changes and spawn kit anomalies",
  "Abnormal tribe activity and alliance transfers",
  "Account linkage and ban-evasion risk signals",
  "Crash and restart anomalies",
  "Transaction abuse (bot credits, duplicate redemptions)",
  "Discord attack patterns (raid joins, phishing links)",
  "Data integrity (save checksums, versioned backups)",
  "Server hardening (DDoS mitigation, credential rotation)",
];

const DETECTION_FAMILY_NOTES: Record<string, string> = {
  "Duplication and impossible inventory growth": "Requires authorised world-save or normalised event evidence; not client-side scanning.",
  "Mesh and base-geometry violations": "Uses authorised save evidence and admin review rather than coordinate-only bans.",
};

export function FairPlay() {
  return (
    <SiteChrome>
      <section aria-labelledby="fair-title" className="py-14 md:py-20">
        <p className="kicker">Fair Play - Trust Centre</p>
        <h2 id="fair-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Fair play is a feature, not a slogan
        </h2>
        <p className="mt-4 max-w-2xl text-base text-vanta-muted md:text-lg">
          The Fair Play Ledger aggregates anti-cheat enforcement transparency with anonymous case
          numbers, a real appeals process, false-positive monitoring and a visible
          admin conflict-of-interest policy.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {DETECTION_FAMILIES.map((f) => (
            <div key={f} className="panel p-5">
              <h3 className="text-lg font-semibold">{f}</h3>
              <p className="mt-2 text-sm text-vanta-muted">{DETECTION_FAMILY_NOTES[f] ?? "Reviewed case handling required."}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
