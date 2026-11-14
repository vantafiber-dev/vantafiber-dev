import { useEffect, useState } from "react";
import { listReportsFn, createReportFn, claimReportFn, addEvidenceFn, resolveReportFn, appealReportFn } from "@/lib/vanta/reports.functions";
import { SiteChrome } from "./SiteChrome";

type Report = {
  id: string;
  player_id: string;
  category: string;
  subject: string;
  body: string;
  status: string;
  claimed_by: string | null;
  evidence: string[];
  resolution: string | null;
  appeal: string | null;
  created_at: string;
};

export function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const rows = await listReportsFn();
      setReports(rows as Report[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reports.");
    }
  }

  useEffect(() => { refresh(); }, []);

  async function onCreate() {
    setError(null);
    if (!subject.trim() || !body.trim()) { setError("Subject and body required."); return; }
    try {
      await createReportFn({ data: { subject: subject.trim(), body: body.trim(), category: "report" } });
      setSubject(""); setBody("");
      setMessage("Report submitted.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
      setMessage(null);
    }
  }

  async function onClaim(id: string) {
    try { await claimReportFn({ data: { id } }); setMessage("Claimed."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Claim failed."); }
  }

  async function onEvidence(id: string) {
    const note = prompt("Evidence note:");
    if (!note) return;
    try { await addEvidenceFn({ data: { id, note } }); setMessage("Evidence added."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Evidence failed."); }
  }

  async function onResolve(id: string) {
    const resolution = prompt("Resolution:");
    if (!resolution) return;
    try { await resolveReportFn({ data: { id, resolution } }); setMessage("Resolved."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Resolve failed."); }
  }

  async function onAppeal(id: string) {
    const reason = prompt("Appeal reason:");
    if (!reason) return;
    try { await appealReportFn({ data: { id, reason } }); setMessage("Appeal submitted."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Appeal failed."); }
  }

  return (
    <SiteChrome>
      <section aria-labelledby="reports-title" className="py-14 md:py-20">
        <p className="kicker">Reports</p>
        <h2 id="reports-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Report to resolution
        </h2>
        <div className="mt-6 flex flex-col gap-2">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" rows={3} className="rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2" />
          <button type="button" onClick={onCreate} className="inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt">Submit report</button>
        </div>
        {error ? <p role="alert" className="mt-2 text-sm text-red-400">{error}</p> : null}
        {message ? <p role="status" className="mt-2 text-sm text-vanta-ash">{message}</p> : null}

        <ul className="mt-6 space-y-2 text-sm">
          {reports.map((c) => (
            <li key={c.id} className="rounded-md border border-vanta-ash p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.subject}</span>
                <span className="kicker">{c.status}</span>
              </div>
              <p className="mt-1 text-vanta-muted">{c.body}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.status === "open" ? <button type="button" onClick={() => onClaim(c.id)} className="rounded-md border border-vanta-ash px-3 py-1">Claim</button> : null}
                {c.status === "claimed" || c.status === "evidence" ? <button type="button" onClick={() => onEvidence(c.id)} className="rounded-md border border-vanta-ash px-3 py-1">Add evidence</button> : null}
                {c.status === "claimed" || c.status === "evidence" ? <button type="button" onClick={() => onResolve(c.id)} className="rounded-md border border-vanta-ash px-3 py-1">Resolve</button> : null}
                {c.status === "resolved" ? <button type="button" onClick={() => onAppeal(c.id)} className="rounded-md border border-vanta-ash px-3 py-1">Appeal</button> : null}
              </div>
              {c.resolution ? <p className="mt-2 text-xs text-vanta-muted">Resolution: {c.resolution}</p> : null}
              {c.appeal ? <p className="mt-1 text-xs text-vanta-muted">Appeal: {c.appeal}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </SiteChrome>
  );
}
