import { useEffect, useState } from "react";
import { listEventsFn, registerEventFn, checkInEventFn } from "@/lib/vanta/events.functions";
import { SiteChrome } from "./SiteChrome";

type Event = { id: string; title: string; format: string; status: string; capacity: number; region: string; rules_version: string };

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try { const rows = await listEventsFn(); setEvents(rows as Event[]); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }
  useEffect(() => { refresh(); }, []);

  async function onRegister(id: string) {
    try { const r = await registerEventFn({ data: { eventId: id } }); setMessage(r.status === "registered" ? "Registered." : "Waitlisted."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }
  async function onCheckIn(id: string) {
    try { await checkInEventFn({ data: { eventId: id } }); setMessage("Checked in."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  return (
    <SiteChrome>
      <section aria-labelledby="events-title" className="py-14 md:py-20">
        <p className="kicker">Events</p>
        <h2 id="events-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Events and raid clock
        </h2>
        {error ? <p role="alert" className="mt-2 text-sm text-red-400">{error}</p> : null}
        {message ? <p role="status" className="mt-2 text-sm text-vanta-ash">{message}</p> : null}
        <div className="mt-8 grid gap-3">
          {events.map((e) => (
            <article key={e.id} className="panel p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold">{e.title}</h3>
                <p className="kicker">{e.status}</p>
              </div>
              <p className="mt-2 text-sm text-vanta-muted">
                {e.format} - capacity {e.capacity} - region {e.region} - rules {e.rules_version}
              </p>
              {e.status === "open" ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => onRegister(e.id)} className="inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt">
                    Register
                  </button>
                  <button type="button" onClick={() => onCheckIn(e.id)} className="inline-flex min-h-12 items-center rounded-md border border-vanta-ash px-5 font-medium">
                    Check in
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
