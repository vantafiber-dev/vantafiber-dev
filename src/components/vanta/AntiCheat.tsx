import { useEffect, useState } from "react";
import { listAnomaliesFn, reportAnomalyFn, investigateAnomalyFn, dismissAnomalyFn, confirmAnomalyFn } from "@/lib/vanta/anticheat.functions";
import { SiteChrome } from "./SiteChrome";

type Anomaly = { id: string; player_id: string; type: string; severity: string; status: string };

export function AntiCheat() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try { const rows = await listAnomaliesFn(); setAnomalies(rows as Anomaly[]); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }
  useEffect(() => { refresh(); }, []);

  async function onReport() {
    setError(null);
    if (!playerId.trim() || !type.trim()) { setError("Player and type required."); return; }
    try { await reportAnomalyFn({ data: { playerId: playerId.trim(), type: type.trim(), severity: "medium" } }); setPlayerId(""); setType(""); setMessage("Anomaly recorded."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  async function onInvestigate(id: string) {
    try { await investigateAnomalyFn({ data: { id } }); setMessage("Investigating."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  async function onDismiss(id: string) {
    const note = prompt("Dismiss note:");
    if (!note) return;
    try { await dismissAnomalyFn({ data: { id, note } }); setMessage("Dismissed."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  async function onConfirm(id: string) {
    const note = prompt("Confirm note:");
    if (!note) return;
    try { await confirmAnomalyFn({ data: { id, note } }); setMessage("Confirmed."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  return (
    <SiteChrome>
      <section aria-labelledby="ac-title" className="py-14 md:py-20">
        <p className="kicker">Anti-cheat</p>
        <h2 id="ac-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Anomaly dashboard
        </h2>
        <div className="mt-6 flex flex-col gap-2">
          <input value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="Player ID" className="rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2" />
          <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Anomaly type" className="rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2" />
          <button type="button" onClick={onReport} className="inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt">Record</button>
        </div>
        {error ? <p role="alert" className="mt-2 text-sm text-red-400">{error}</p> : null}
        {message ? <p role="status" className="mt-2 text-sm text-vanta-ash">{message}</p> : null}
        <ul className="mt-6 space-y-2 text-sm">
          {anomalies.map((a) => (
            <li key={a.id} className="rounded-md border border-vanta-ash p-2">
              {a.player_id} - {a.type} - {a.severity} - {a.status}
              <div className="mt-2 flex gap-2">
                {a.status === "open" ? <button type="button" onClick={() => onInvestigate(a.id)} className="rounded-md border border-vanta-ash px-3 py-1">Investigate</button> : null}
                {a.status !== "confirmed" && a.status !== "dismissed" ? <button type="button" onClick={() => onDismiss(a.id)} className="rounded-md border border-vanta-ash px-3 py-1">Dismiss</button> : null}
                {a.status !== "confirmed" && a.status !== "dismissed" ? <button type="button" onClick={() => onConfirm(a.id)} className="rounded-md border border-vanta-ash px-3 py-1">Confirm</button> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </SiteChrome>
  );
}
