import { useLab, allSpecIds, confirmatoryIds, instrumentIds } from "@/lib/omeil/store.ts";
import { programmeSpecs } from "@/lib/omeil/experiments.ts";
import { Explorer3D } from "@/components/omeil/Explorer3D.tsx";

export type Section =
  | "overview"
  | "command"
  | "lab"
  | "worlds"
  | "explorer"
  | "anomalies"
  | "stats"
  | "hypotheses"
  | "swarm"
  | "knowledge"
  | "literature"
  | "archive"
  | "repro"
  | "reports"
  | "coverage"
  | "settings";

const card = "rounded-lg border border-line bg-raised p-4";

export function SectionBody({
  section,
  selectedId,
  onSelect,
  onNavigate,
}: {
  section: Section;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onNavigate: (s: Section) => void;
}) {
  const runs = useLab((s) => s.runs);
  const logs = useLab((s) => s.logs);
  const selfTests = useLab((s) => s.selfTests);
  const settings = useLab((s) => s.settings);
  const setSettings = useLab((s) => s.setSettings);
  const running = useLab((s) => s.running);
  const runIds = useLab((s) => s.runIds);
  const runSelf = useLab((s) => s.runSelf);
  const clearAll = useLab((s) => s.clearAll);

  const specs = programmeSpecs();

  if (section === "explorer") {
    const run = runs.find((r) => r.id === selectedId) ?? runs[runs.length - 1];
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">3D explorer</h2>
        {run?.replay ? <Explorer3D replay={run.replay} frameIndex={run.replay.frames.length - 1} reducedMotion={false} /> : <p className="text-sm text-muted">No replay available. Run experiments first.</p>}
      </div>
    );
  }

  if (section === "settings") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Settings</h2>
        <div className={card}>
          <label className="block text-sm">Trials: {settings.trials}</label>
          <input type="range" min={1} max={20} value={settings.trials} onChange={(e) => setSettings({ trials: Number(e.target.value) })} className="w-full" />
          <label className="mt-3 block text-sm">Steps: {settings.steps}</label>
          <input type="range" min={10} max={200} value={settings.steps} onChange={(e) => setSettings({ steps: Number(e.target.value) })} className="w-full" />
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.reducedMotion} onChange={(e) => setSettings({ reducedMotion: e.target.checked })} />
            Reduced motion
          </label>
          <button onClick={clearAll} className="mt-3 rounded-md border border-danger px-3 py-1 text-sm text-danger">Clear all records</button>
        </div>
      </div>
    );
  }

  if (section === "command") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Command</h2>
        <div className="flex flex-wrap gap-2">
          <button disabled={running} onClick={() => runIds(allSpecIds())} className="rounded-md bg-accent px-3 py-2 text-sm text-accent-ink disabled:opacity-50">Run all ({allSpecIds().length})</button>
          <button disabled={running} onClick={() => runIds(confirmatoryIds())} className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50">Run confirmatory ({confirmatoryIds().length})</button>
          <button disabled={running} onClick={() => runIds(instrumentIds())} className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50">Run instruments ({instrumentIds().length})</button>
          <button disabled={running} onClick={runSelf} className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50">Run self-tests</button>
        </div>
        {running && <p className="text-sm text-muted">Running…</p>}
      </div>
    );
  }

  if (section === "lab") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Laboratory</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {specs.map((s) => (
            <button
              key={s.id}
              disabled={running}
              onClick={() => runIds([s.id])}
              className="rounded-md border border-line p-3 text-left text-sm hover:bg-raised disabled:opacity-50"
            >
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-muted">{s.domain}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (section === "overview") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Overview</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className={card}><div className="text-xs text-muted">Runs</div><div className="text-2xl font-semibold">{runs.length}</div></div>
          <div className={card}><div className="text-xs text-muted">Self-tests</div><div className="text-2xl font-semibold">{selfTests.filter((t) => t.passed).length}/{selfTests.length}</div></div>
          <div className={card}><div className="text-xs text-muted">Specs</div><div className="text-2xl font-semibold">{specs.length}</div></div>
        </div>
        <div className={card}>
          <h3 className="mb-2 font-medium">Recent runs</h3>
          {runs.length === 0 ? <p className="text-sm text-muted">No runs yet. Use Command or Laboratory.</p> : (
            <ul className="space-y-1 text-sm">
              {runs.slice(-8).reverse().map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <button className="text-left hover:underline" onClick={() => { onSelect(r.id); onNavigate("explorer"); }}>{r.title}</button>
                  <span className="text-xs text-muted">{r.classification}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  const genericRuns = runs;

  if (section === "anomalies") {
    const anom = genericRuns.filter((r) => r.classification.includes("unusual") || r.classification.includes("anomal"));
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Anomalies</h2>
        {anom.length === 0 ? <p className="text-sm text-muted">No anomalies flagged yet.</p> : (
          <ul className="space-y-2">{anom.map((r) => <li key={r.id} className={card}><div className="font-medium">{r.title}</div><div className="text-xs text-muted">{r.classification}</div></li>)}</ul>
        )}
      </div>
    );
  }

  if (section === "stats") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Statistics</h2>
        {genericRuns.length === 0 ? <p className="text-sm text-muted">No data.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted"><th className="py-1">Title</th><th>coop</th><th>gini</th><th>efficiency</th></tr></thead>
              <tbody>
                {genericRuns.map((r) => {
                  const m = r.trials[0]?.metrics;
                  return <tr key={r.id} className="border-t border-line"><td className="py-1">{r.title}</td><td>{m?.cooperation?.toFixed(3)}</td><td>{m?.gini?.toFixed(3)}</td><td>{m?.efficiency?.toFixed(3)}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (section === "hypotheses") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Hypotheses</h2>
        <ul className="space-y-2">
          {genericRuns.map((r) => (
            <li key={r.id} className={card}>
              <div className="font-medium">{r.title}</div>
              <div className="text-xs text-muted">H: {r.hypothesis}</div>
              <div className="text-xs text-muted">Alt: {r.alternative}</div>
            </li>
          ))}
          {genericRuns.length === 0 && <p className="text-sm text-muted">No hypotheses yet.</p>}
        </ul>
      </div>
    );
  }

  if (section === "literature") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Literature</h2>
        <ul className="space-y-2">
          {genericRuns.map((r) => (
            <li key={r.id} className={card}>
              <div className="font-medium">{r.title}</div>
              <ul className="mt-1 list-disc pl-4 text-xs text-muted">{r.citations.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </li>
          ))}
          {genericRuns.length === 0 && <p className="text-sm text-muted">No citations yet.</p>}
        </ul>
      </div>
    );
  }

  if (section === "archive") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Archive</h2>
        <ul className="space-y-1 text-sm">
          {genericRuns.map((r) => <li key={r.id}>{r.id} · {r.title} · {r.status}</li>)}
          {genericRuns.length === 0 && <p className="text-sm text-muted">Empty.</p>}
        </ul>
      </div>
    );
  }

  if (section === "repro") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reproducibility</h2>
        {genericRuns.slice(-3).map((r) => (
          <div key={r.id} className={card}>
            <div className="font-medium">{r.title}</div>
            <pre className="mt-2 overflow-x-auto text-xs text-muted">{JSON.stringify(r.provenance, null, 2)}</pre>
          </div>
        ))}
        {genericRuns.length === 0 && <p className="text-sm text-muted">No records.</p>}
      </div>
    );
  }

  if (section === "reports") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reports</h2>
        {genericRuns.slice(-3).map((r) => (
          <div key={r.id} className={card}>
            <div className="font-medium">{r.title}</div>
            <p className="text-xs text-muted">{r.question}</p>
            <p className="text-xs">{r.levelRationale}</p>
          </div>
        ))}
        {genericRuns.length === 0 && <p className="text-sm text-muted">No reports.</p>}
      </div>
    );
  }

  if (section === "coverage") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Coverage</h2>
        <p className="text-sm text-muted">{genericRuns.length} experiments recorded across {new Set(genericRuns.map((r) => r.domain)).size} domains.</p>
      </div>
    );
  }

  if (section === "worlds") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Worlds</h2>
        <p className="text-sm text-muted">Spatial commons simulation worlds. Run experiments to populate.</p>
        <ul className="text-sm">{genericRuns.map((r) => <li key={r.id}>{r.title} ({r.trials.length} trials)</li>)}</ul>
      </div>
    );
  }

  if (section === "swarm") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Swarm</h2>
        <p className="text-sm text-muted">Agent swarm inspection.</p>
        <ul className="text-sm">{genericRuns.map((r) => <li key={r.id}>{r.title}: {r.trials[0]?.metrics?.survival?.toFixed(3)} survival</li>)}</ul>
      </div>
    );
  }

  if (section === "knowledge") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Knowledge</h2>
        <ul className="space-y-1 text-sm">{genericRuns.map((r) => <li key={r.id}>{r.title} — {r.discoveryLevel} level</li>)}</ul>
        {genericRuns.length === 0 && <p className="text-sm text-muted">No knowledge yet.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold capitalize">{section}</h2>
      <p className="text-sm text-muted">Logs: {logs.length}</p>
    </div>
  );
}
