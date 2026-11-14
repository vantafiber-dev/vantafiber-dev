import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { VANTA } from "@/lib/vanta/brand";
import { defaultWaitlistStorage, createWaitlistStore } from "@/lib/vanta/waitlist";
import { SiteChrome } from "./SiteChrome";
import { joinWaitlistFn } from "@/lib/vanta/waitlist.functions";

export function Join() {
  const [platform, setPlatform] = useState<string>("xbox");
  const [region, setRegion] = useState<string>(VANTA.regions[0]?.id ?? "");
  const [email, setEmail] = useState<string>("");
  const [agreedToRules, setAgreedToRules] = useState<boolean>(false);
  const [optedInUpdates, setOptedInUpdates] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean>(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setOk(false);
    if (!agreedToRules) {
      setError("You must agree to the community rules.");
      return;
    }
    try {
      await joinWaitlistFn({ data: { email, platform: platform as "xbox" | "windows-store", region, consent: agreedToRules } });
      setOk(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Join failed.");
    }
  }

  return (
    <SiteChrome>
      <section aria-labelledby="join-title" className="py-14 md:py-20">
        <p className="kicker">Join Compass - Season Zero</p>
        <h2 id="join-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Get your seat in the first fight
        </h2>
        <p className="mt-4 max-w-2xl text-base text-vanta-muted md:text-lg">
          Tell us your platform and region, opt in to the waitlist, and you will receive the
          Season Zero briefing, raid calendar and event invites before launch. Zero account
          required for the prelaunch waitlist.
        </p>

        <ol className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            { id: "step-1", title: "Choose platform and region", body: "Xbox console or Windows Microsoft Store client." },
            { id: "step-2", title: "Join the waitlist", body: "Double opt-in consent captured locally." },
            { id: "step-3", title: "Get invited into a tribe listing", body: "Matched via the member or Discord workflow." },
          ].map((s) => (
            <li key={s.id} className="panel p-5">
              <span className="num text-2xl font-semibold text-vanta-ember">{s.id.replace("step-", "0")}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-vanta-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="waitlist-title" className="pb-20">
        <div className="panel p-6">
          <h2 id="waitlist-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
            Season Zero waitlist
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-vanta-muted md:text-base">
            Entries are now stored in the application database. Live email delivery is owner-gated.
          </p>
          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <label className="kicker" htmlFor="vf-email">Email</label>
              <input
                id="vf-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 rounded-md border border-line bg-surface px-3 text-vanta-ash"
              />
            </div>
            <fieldset className="grid gap-2">
              <legend className="kicker">Platform</legend>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    { id: "xbox", label: VANTA.platform.xbox.label },
                    { id: "windows-store", label: VANTA.platform.windowsStore.label },
                  ] as const
                ).map((p) => (
                  <label key={p.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-2">
                    <input
                      type="radio"
                      name="vf-platform"
                      value={p.id}
                      checked={platform === p.id}
                      onChange={() => setPlatform(p.id)}
                    />
                    <span className="text-sm">{p.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-2">
              <label className="kicker" htmlFor="vf-region">Region</label>
              <select
                id="vf-region"
                name="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="min-h-12 rounded-md border border-line bg-surface px-3 text-vanta-ash"
              >
                {VANTA.regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="flex min-h-11 items-start gap-2 text-sm text-vanta-ash">
                <input
                  type="checkbox"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I agree to the community rules and community waitlist terms. I understand this
                  is not a purchase and does not reserve in-game advantage.
                </span>
              </label>
              <label className="flex min-h-11 items-start gap-2 text-sm text-vanta-ash">
                <input
                  type="checkbox"
                  checked={optedInUpdates}
                  onChange={(e) => setOptedInUpdates(e.target.checked)}
                  className="mt-1"
                />
                <span>Send me launch and event updates (optional, can be withdrawn).</span>
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt"
            >
              Join the waitlist
            </button>
            {error ? (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}
            {ok ? (
              <p role="status" className="text-sm text-vanta-ash">
                You are on the Season Zero waitlist. Watch your inbox for the briefing.
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </SiteChrome>
  );
}
