import { useEffect, useState } from "react";
import { pledgeFn, requestRealmFn, listPledgesFn, listRealmRequestsFn } from "@/lib/vanta/commerce.functions";
import { SiteChrome } from "./SiteChrome";

const TIERS = [
  { id: "supporter", name: "Supporter", amountUsd: 5, perks: ["Discord role", "Name in credits"] },
  { id: "founder", name: "Founder", amountUsd: 25, perks: ["Supporter perks", "Founder badge", "Early access"] },
  { id: "patron", name: "Patron", amountUsd: 100, perks: ["Founder perks", "Private realm invite", "Creator shoutout"] },
];

export function Commerce() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pledges, setPledges] = useState<{ id: string; tier_id: string; amount_usd: number; status: string }[]>([]);
  const [realms, setRealms] = useState<{ id: string; tribe_name: string; status: string }[]>([]);

  async function refresh() {
    try {
      const [p, r] = await Promise.all([listPledgesFn(), listRealmRequestsFn()]);
      setPledges(p as any);
      setRealms(r as any);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }
  useEffect(() => { refresh(); }, []);

  async function onPledge(tierId: string, amountUsd: number) {
    setError(null);
    try { await pledgeFn({ data: { tierId, amountUsd } }); setMessage(`Pledged ${amountUsd} USD.`); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }
  async function onRequestRealm() {
    try { await requestRealmFn({ data: { tribeName: "Tribe One", region: "Australia (AU)" } }); setMessage("Realm request submitted."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  return (
    <SiteChrome>
      <section aria-labelledby="commerce-title" className="py-14 md:py-20">
        <p className="kicker">Commerce</p>
        <h2 id="commerce-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Fundraising and private realms
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-vanta-muted">
          Payment processing is owner-gated. Pledges are recorded in the database.
        </p>
        {error ? <p role="alert" className="mt-2 text-sm text-red-400">{error}</p> : null}
        {message ? <p role="status" className="mt-2 text-sm text-vanta-ash">{message}</p> : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TIERS.map((t) => (
            <article key={t.id} className="panel p-5">
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-1 text-2xl font-semibold">{t.amountUsd} USD</p>
              <ul className="mt-3 space-y-1 text-sm text-vanta-muted">
                {t.perks.map((p) => (<li key={p}>- {p}</li>))}
              </ul>
              <button type="button" onClick={() => onPledge(t.id, t.amountUsd)} className="mt-4 inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt">
                Pledge
              </button>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <button type="button" onClick={onRequestRealm} className="inline-flex min-h-12 items-center rounded-md border border-vanta-ash px-5 font-medium">
            Request a private realm
          </button>
        </div>
        <div className="mt-6 text-xs text-vanta-muted">
          Pledges: {pledges.length} | Realm requests: {realms.length}
        </div>
      </section>
    </SiteChrome>
  );
}
