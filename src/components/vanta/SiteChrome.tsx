import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { VANTA } from "@/lib/vanta/brand";

const NAV_ITEMS = [
  { href: "/join", label: "Join" },
  { href: "/status", label: "Status" },
  { href: "/seasons", label: "Seasons" },
  { href: "/fair-play", label: "Fair Play" },
  { href: "/help", label: "Help" },
];

export function SiteChrome({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-vanta-basalt text-vanta-ash">
      <header className="sticky top-0 z-20 border-b border-line bg-vanta-basalt/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <div className="min-w-0 flex-1">
            <p className="kicker">Season Zero - Xbox ASE</p>
            <h1 className="truncate text-lg font-semibold tracking-tight">{VANTA.name}</h1>
          </div>
          <nav className="hidden md:flex" aria-label="Primary">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted hover:text-vanta-ash"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link
            to="/join"
            className="inline-flex min-h-11 shrink-0 items-center rounded-md bg-vanta-ember px-3 text-sm font-medium text-vanta-basalt"
          >
            Join the waitlist
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line px-4 py-8 md:px-6">
        <p className="text-sm text-vanta-muted">
          Vanta Fiber is an independent community project and is not affiliated with or endorsed
          by Studio Wildcard, Microsoft, Xbox, or the hosting provider. ARK and related names
          remain property of their respective owners.
        </p>
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Footer">
          {NAV_ITEMS.map((l) => (
            <Link key={l.href} to={l.href} className="text-vanta-ember">
              {l.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
