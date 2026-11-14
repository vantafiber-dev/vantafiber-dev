import { SiteChrome } from "./SiteChrome";
import { VANTA } from "@/lib/vanta/brand";

export function Seasons() {
  return (
    <SiteChrome>
      <section aria-labelledby="season-title" className="py-14 md:py-20">
        <p className="kicker">Season briefing - {VANTA.seasonName}</p>
        <h2 id="season-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Season Zero briefing
        </h2>
        <p className="mt-4 max-w-2xl text-base text-vanta-muted md:text-lg">
          One concise page with start time in the player timezone, rates summary, meaningful
          rule changes, carry-over policy, map availability, staff coverage and the next event.
          Plain-text and low-bandwidth versions are part of the delivery contract.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <div className="panel p-6">
            <h3 className="text-xl font-semibold">Rates summary</h3>
            <p className="mt-2 text-sm text-vanta-muted">
              Three independently balanced modes are designed for empirical comparison: high-speed
              true fibercraft, 100x competitive fibercraft, and premium fast-PvP hybrids. Prototype
              presets are configuration candidates pending Xbox ASE playtests.
            </p>
          </div>
          <div className="panel p-6">
            <h3 className="text-xl font-semibold">Carry-over policy</h3>
            <p className="mt-2 text-sm text-vanta-muted">
              Achievements, event results and public recognition carry over by choice. Gameplay
              advantage resets according to the published wipe rules.
            </p>
          </div>
          <div className="panel p-6">
            <h3 className="text-xl font-semibold">Map availability</h3>
            <p className="mt-2 text-sm text-vanta-muted">
              Map additions are gated on demand evidence, capacity and budget. No proposed map is
              assumed to be day-one hosted.
            </p>
          </div>
          <div className="panel p-6">
            <h3 className="text-xl font-semibold">Staff coverage</h3>
            <p className="mt-2 text-sm text-vanta-muted">
              Event coverage is sized from actual staff availability, not assumed volunteer hours.
            </p>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
