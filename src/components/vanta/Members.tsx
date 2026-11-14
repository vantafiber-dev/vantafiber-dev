import { useEffect, useState } from "react";
import { listTribesFn, listMembersFn, createTribeFn, joinTribeFn, leaveTribeFn, setRoleFn, reputationFn, ensureMemberFn } from "@/lib/vanta/members.functions";
import { SiteChrome } from "./SiteChrome";

type Tribe = { id: string; name: string; region: string; motto: string };
type Member = { id: string; handle: string; tribe_id: string | null; role: string; reputation: number };

export function Members() {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tribeName, setTribeName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      await ensureMemberFn();
      const [t, m] = await Promise.all([listTribesFn(), listMembersFn()]);
      setTribes(t as Tribe[]);
      setMembers(m as Member[]);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }
  useEffect(() => { refresh(); }, []);

  async function onCreateTribe() {
    setError(null);
    if (!tribeName.trim()) { setError("Tribe name required."); return; }
    try { await createTribeFn({ data: { name: tribeName.trim(), region: "Australia (AU)", motto: "Hold the line" } }); setTribeName(""); setMessage("Tribe created."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  async function onJoin(tribeId: string) {
    const memberId = members[0]?.id;
    if (!memberId) return;
    try { await joinTribeFn({ data: { memberId, tribeId } }); setMessage("Joined."); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  }

  return (
    <SiteChrome>
      <section aria-labelledby="members-title" className="py-14 md:py-20">
        <p className="kicker">Members</p>
        <h2 id="members-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Tribes and member profiles
        </h2>
        <div className="mt-6 flex gap-2">
          <input value={tribeName} onChange={(e) => setTribeName(e.target.value)} placeholder="New tribe name" className="flex-1 rounded-md border border-vanta-ash bg-vanta-slate px-3 py-2" />
          <button type="button" onClick={onCreateTribe} className="inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt">Create</button>
        </div>
        {error ? <p role="alert" className="mt-2 text-sm text-red-400">{error}</p> : null}
        {message ? <p role="status" className="mt-2 text-sm text-vanta-ash">{message}</p> : null}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="panel p-5">
            <h3 className="text-lg font-semibold">Tribes</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {tribes.length === 0 ? <li className="text-vanta-muted">No tribes yet.</li> : null}
              {tribes.map((t) => (
                <li key={t.id} className="rounded-md border border-vanta-ash p-2 flex items-center justify-between">
                  <span>{t.name} - {t.region}</span>
                  <button type="button" onClick={() => onJoin(t.id)} className="rounded-md border border-vanta-ash px-3 py-1">Join</button>
                </li>
              ))}
            </ul>
          </article>
          <article className="panel p-5">
            <h3 className="text-lg font-semibold">Members</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {members.map((m) => (
                <li key={m.id} className="rounded-md border border-vanta-ash p-2">
                  {m.handle} - {m.role} - rep {m.reputation} {m.tribe_id ? "(in tribe)" : ""}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </SiteChrome>
  );
}
