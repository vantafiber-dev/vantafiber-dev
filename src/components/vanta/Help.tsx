import { SiteChrome } from "./SiteChrome";

const HELP_TOPICS = [
  {
    id: "how-to-join",
    title: "How to join",
    body: "Pick your platform (Xbox console or Windows Microsoft Store), join the waitlist, receive the Season Zero briefing, and get invited into a tribe listing through the member or Discord workflow.",
  },
  {
    id: "report",
    title: "Report cheating or misconduct",
    body: "Use the in-game or Discord report path. Reports are triaged with evidence, never punished automatically.",
  },
  {
    id: "appeal",
    title: "Appeal a moderation action",
    body: "Appeals go through a human reviewer with an independent appeals queue. Severe enforcement never relies on automated sign-off.",
  },
  {
    id: "ticket",
    title: "Open or follow a support ticket",
    body: "Staff-handled tickets carry case owners, evidence handling and clear closure expectations.",
  },
];

export function Help() {
  return (
    <SiteChrome>
      <section aria-labelledby="help-title" className="py-14 md:py-20">
        <p className="kicker">Help centre</p>
        <h2 id="help-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Help, reports and appeals
        </h2>
        <p className="mt-4 max-w-2xl text-base text-vanta-muted md:text-lg">
          Support routes are staff-handled with case ownership, evidence handling and clear
          closure. Automated signals may prioritise review; missing telemetry is never treated as
          proof of innocence or guilt.
        </p>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {HELP_TOPICS.map((h) => (
            <div key={h.id} className="panel p-5">
              <h3 className="text-lg font-semibold">{h.title}</h3>
              <p className="mt-2 text-sm text-vanta-muted">{h.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
