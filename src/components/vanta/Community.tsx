import { useEffect, useState } from "react";
import { listLfgFn, createLfgFn, closeLfgFn, listTicketsFn, createTicketFn } from "@/lib/vanta/community.functions";
import { SiteChrome } from "./SiteChrome";

type Lfg = { id: string; title: string; status: string; region: string };
type Ticket = { id: string; subject: string; status: string };

export function Community() {
  const [lfgs, setLfgs] = useState<Lfg[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [lfgTitle, setLfgTitle] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketBody, setTicketBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [l, t] = await Promise.all([listLfgFn(), listTicketsFn()]);
      setLfgs(l as Lfg[]);
      setTickets(t as Ticket[]);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }
  useEffect(() => { refresh(); }, []);

  async function onCreatePost() {
    setError(null);
    if (!lfgTitle.trim()) { setError("Title required."); return; }
    try { await createLfgFn({ data: { region: "Australia (AU)", mode: "pvp", title: lfgTitle.trim(), note: "fixture" } }); setLfgTitle(""); setMessage("Post created."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }
  async function onClose(id: string) {
    try { await closeLfgFn({ data: { id } }); setMessage("Closed."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }
  async function onCreateTicket() {
    setError(null);
    if (!ticketSubject.trim() || !ticketBody.trim()) { setError("Subject and body required."); return; }
    try { await createTicketFn({ data: { category: "support", subject: ticketSubject.trim(), body: ticketBody.trim() } }); setTicketSubject(""); setTicketBody(""); setMessage("Ticket created."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  return (
    <SiteChrome>
      <section aria-labelledby="community-title" className="py-14 md:py-20">
        <p className="kicker">Community</p>
        <h2 id="community-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          LFG board and support tickets
        </h2>
        {error ? <p role="alert" className="mt-2 text-sm text-red-400">{error}</p> : null}
        {message ? <p role="status" className="mt-2 text-sm text-vanta-ash">{message}</p> : null}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="panel p-5">
            <h3 className="text-lg font-semibold">New LFG post</h3>
            <input value={lfgTitle} onChange={(e) => setLfgTitle(e.target.value)} placeholder="Title" className="mt-3 w-full rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2" />
            <button type="button" onClick={onCreatePost} className="mt-3 inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt">Post</button>
            <ul className="mt-4 space-y-2 text-sm">
              {lfgs.map((p) => (
                <li key={p.id} className="rounded-md border border-vanta-ash p-2 flex items-center justify-between">
                  <span>{p.title} - {p.status} ({p.region})</span>
                  {p.status === "open" ? <button type="button" onClick={() => onClose(p.id)} className="rounded-md border border-vanta-ash px-3 py-1">Close</button> : null}
                </li>
              ))}
            </ul>
          </article>
          <article className="panel p-5">
            <h3 className="text-lg font-semibold">New support ticket</h3>
            <input value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} placeholder="Subject" className="mt-3 w-full rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2" />
            <textarea value={ticketBody} onChange={(e) => setTicketBody(e.target.value)} placeholder="Body" rows={3} className="mt-2 w-full rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2" />
            <button type="button" onClick={onCreateTicket} className="mt-3 inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt">Submit</button>
            <ul className="mt-4 space-y-2 text-sm">
              {tickets.map((t) => (
                <li key={t.id} className="rounded-md border border-vanta-ash p-2">{t.subject} - {t.status}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </SiteChrome>
  );
}
