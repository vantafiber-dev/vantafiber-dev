import { useEffect, useState } from "react";
import { listIncidentsFn, openIncidentFn, mitigateIncidentFn, resolveIncidentFn } from "@/lib/vanta/incidents.functions";
import { SiteChrome } from "./SiteChrome";

type Incident = { id: string; title: string; severity: string; status: string; started_at: string };

export function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try { const rows = await listIncidentsFn(); setIncidents(rows as Incident[]); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to load."); }
  }
  useEffect(() => { refresh(); }, []);

  async function onOpen() {
    setError(null);
    if (!title.trim()) { setError("Title required."); return; }
    try { await openIncidentFn({ data: { title: title.trim(), severity: "medium" } }); setTitle(""); setMessage("Incident opened."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Open failed."); }
  }

  async function onMitigate(id: string) {
    const note = prompt("Mitigation note:");
    if (!note) return;
    try { await mitigateIncidentFn({ data: { id, note } }); setMessage("Mitigating."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  async function onResolve(id: string) {
    const note = prompt("Resolution note:");
    if (!note) return;
    try { await resolveIncidentFn({ data: { id, note } }); setMessage("Resolved."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  return (
    <SiteChrome>
      <section aria-labelledby="inc-title" className="py-14 md:py-20">
        <p className="kicker">Incidents</p>
        <h2 id="inc-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Incident history
        </h2>
        <div className="mt-6 flex gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Incident title" className="flex-1 rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2" />
          <button type="button" onClick={onOpen} className="inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt">Open</button>
        </div>
        {error ? <p role="alert" className="mt-2 text-sm text-red-400">{error}</p> : null}
        {message ? <p role="status" className="mt-2 text-sm text-vanta-ash">{message}</p> : null}
        <ul className="mt-6 space-y-2 text-sm">
          {incidents.map((i) => (
            <li key={i.id} className="rounded-md border border-vanta-ash p-2">
              {i.title} - {i.severity} - {i.status}
              <div className="mt-2 flex gap-2">
                {i.status !== "resolved" ? <button type="button" onClick={() => onMitigate(i.id)} className="rounded-md border border-vanta-ash px-3 py-1">Mitigate</button> : null}
                {i.status !== "resolved" ? <button type="button" onClick={() => onResolve(i.id)} className="rounded-md border border-vanta-ash px-3 py-1">Resolve</button> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </SiteChrome>
  );
}
