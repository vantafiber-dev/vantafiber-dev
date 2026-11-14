import { Link } from "@tanstack/react-router";
import { CalendarClock, ScrollText, ShieldCheck, Users } from "lucide-react";
import { VANTA } from "@/lib/vanta/brand";
import { SiteChrome } from "./SiteChrome";

const DIFFERENTIATORS = [
  {
    id: "raid-clock",
    icon: CalendarClock,
    title: "Raid Clock",
    body: "One player-local timeline for season start, raid windows where enforceable, maintenance and wipes.",
  },
  {
    id: "tribe-grid",
    icon: Users,
    title: "Tribe Starting Grid",
    body: "Opt-in, size- and time-window-matched listings with moderated recruitment and a first-session checklist.",
  },
  {
    id: "rule-lab",
    icon: ScrollText,
    title: "Rule Lab",
    body: "Versioned proposals show expected effects on build time, raid cost, defence and console performance.",
  },
  {
    id: "season-passport",
    icon: ShieldCheck,
    title: "Season Passport",
    body: "Carry over achievements, event results and public recognition by choice, with advantage resetting per wipe rules.",
  },
];

const JOIN_STEPS = [
  {
    id: "step-1",
    title: "Choose platform and region",
    body: "Tell us you are on Xbox or the Windows Microsoft Store client and pick your region.",
  },
  {
    id: "step-2",
    title: "Join the waitlist",
    body: "Opt in with consent. You get the Season Zero briefing, raid calendar and event invites.",
  },
  {
    id: "step-3",
    title: "Get invited into a tribe listing",
    body: "Matched through the member or Discord workflow with a first-session checklist.",
  },
];

export function Home() {
  return (
    <SiteChrome>
      <section aria-labelledby="hero-title" className="py-14 md:py-24">
        <p className="kicker">Xbox - Microsoft Store - ARK: Survival Evolved</p>
        <h2 id="hero-title" className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Build fast. Fight fair.
        </h2>
        <p className="mt-5 max-w-2xl text-base text-vanta-muted md:text-lg">
          {VANTA.tagline} The free-first fibercraft PvP community for Xbox consoles and the
          compatible Windows Microsoft Store client. Season Zero builds the community, the rules
          and the readiness proof before the first public server goes live.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/join"
            className="inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt"
          >
            Join the waitlist
          </Link>
          <Link
            to="/join"
            className="inline-flex min-h-12 items-center rounded-md border border-line px-5 text-vanta-ash"
          >
            How to join
          </Link>
        </div>
      </section>

      <section aria-labelledby="status-title" className="pb-14">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "Season", value: VANTA.seasonName, note: "Prelaunch community build" },
            { label: "Server", value: "Awaiting host capacity", note: "Readiness board engaged" },
            { label: "Platform", value: "Xbox + Windows Store", note: "ASE PvP target" },
          ].map((c) => (
            <div key={c.label} className="panel p-4">
              <p className="kicker">{c.label}</p>
              <p className="mt-2 text-lg font-semibold">{c.value}</p>
              <p className="mt-1 text-sm text-vanta-muted">{c.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="diff-title" className="pb-14">
        <h2 id="diff-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
          Why players switch to Vanta Fiber
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {DIFFERENTIATORS.map((d) => {
            const Icon = d.icon;
            return (
              <article key={d.id} className="panel p-5">
                <Icon className="size-6 text-vanta-ember" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-semibold">{d.title}</h3>
                <p className="mt-2 text-sm text-vanta-muted">{d.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="join-title" className="pb-14">
        <h2 id="join-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
          Join in three steps
        </h2>
        <ol className="mt-6 grid gap-3">
          {JOIN_STEPS.map((s) => (
            <li key={s.id} className="panel flex gap-4 p-5">
              <span className="num text-2xl font-semibold text-vanta-ember">{s.id.replace("step-", "0")}</span>
              <div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-vanta-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="ready-title" className="pb-14">
        <div className="panel p-6">
          <h2 id="ready-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
            Season Zero readiness board
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-vanta-muted md:text-base">
            The launch gate is evidence, not optimism. Public readiness stages, funding
            verification, hosting readiness, staff coverage and player demand all have to clear
            their own bars before a launch date is announced.
          </p>
          <Link
            to="/status"
            className="mt-6 inline-flex min-h-12 items-center rounded-md border border-line px-5 text-vanta-ash"
          >
            View status and readiness
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
