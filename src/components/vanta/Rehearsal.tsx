import { useState } from "react";
import { createWipeRehearsal, runWipeRehearsal, rehearsalSummary } from "@/lib/vanta/wipe-rehearsal";
import { SiteChrome } from "./SiteChrome";

export function Rehearsal() {
  const [rehearsal, setRehearsal] = useState<ReturnType<typeof createWipeRehearsal> | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onRun() {
    const r = runWipeRehearsal(createWipeRehearsal());
    setRehearsal(r);
    setMessage(rehearsalSummary(r));
  }

  return (
    <SiteChrome>
      <section aria-labelledby="rehearsal-title" className="py-14 md:py-20">
        <p className="kicker">Wipe rehearsal</p>
        <h2 id="rehearsal-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Season wipe rehearsal (fixture)
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-vanta-muted">
          Runs the full wipe sequence in fixture mode. No live server is touched.
        </p>
        <button
          type="button"
          onClick={onRun}
          className="mt-4 inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt"
        >
          Run rehearsal
        </button>

        {rehearsal ? (
          <ul className="mt-6 space-y-2 text-sm">
            {rehearsal.steps.map((s) => (
              <li key={s.id} className="rounded-md border border-vanta-ash p-2">
                {s.label} - {s.status}
              </li>
            ))}
          </ul>
        ) : null}

        {message ? (
          <p role="status" className="mt-4 text-sm text-vanta-ash">
            {message}
          </p>
        ) : null}
      </section>
    </SiteChrome>
  );
}
