import { useEffect, useState } from "react";
import {
  Activity,
  Archive,
  BookOpen,
  Box,
  FileText,
  FlaskConical,
  Grid3x3,
  Library,
  Lightbulb,
  ListChecks,
  Network,
  OctagonX,
  Settings,
  Share2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { SectionBody, type Section } from "@/components/omeil/sections";
import { useLab } from "@/lib/omeil/store.ts";

const NAV: { id: Section; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "command", label: "Command", icon: ListChecks },
  { id: "lab", label: "Laboratory", icon: FlaskConical },
  { id: "worlds", label: "Worlds", icon: Grid3x3 },
  { id: "explorer", label: "3D explorer", icon: Box },
  { id: "anomalies", label: "Anomalies", icon: TriangleAlert },
  { id: "stats", label: "Statistics", icon: Share2 },
  { id: "hypotheses", label: "Hypotheses", icon: Lightbulb },
  { id: "swarm", label: "Swarm", icon: Users },
  { id: "knowledge", label: "Knowledge", icon: Network },
  { id: "literature", label: "Literature", icon: Library },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "repro", label: "Reproducibility", icon: BookOpen },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "coverage", label: "Coverage", icon: Grid3x3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Workstation() {
  const [section, setSection] = useState<Section>("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const hydrated = useLab((s) => s.hydrated);
  const setHydrated = useLab((s) => s.setHydrated);
  const running = useLab((s) => s.running);
  const progress = useLab((s) => s.progress);
  const stop = useLab((s) => s.stop);

  useEffect(() => {
    let cancel = false;
    void useLab.persist.rehydrate().finally(() => {
      if (!cancel) setHydrated(true);
    });
    return () => {
      cancel = true;
    };
  }, [setHydrated]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <div className="min-w-0 flex-1">
            <p className="kicker">Local synthetic laboratory</p>
            <h1 className="truncate text-lg font-semibold tracking-tight">OMEIL</h1>
          </div>
          <button
            type="button"
            onClick={stop}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-danger bg-raised px-3 text-sm text-danger"
          >
            <OctagonX className="size-4" aria-hidden="true" />
            Stop
          </button>
        </div>
        {running && progress ? (
          <div className="px-4 pb-3 md:px-6">
            <div className="mb-1 flex justify-between gap-3 text-xs text-muted">
              <span className="truncate">{progress.label}</span>
              <span className="num">
                {progress.done}/{progress.total}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-line">
              <div
                className="h-full origin-left bg-accent"
                style={{ transform: `scaleX(${progress.total ? progress.done / progress.total : 0})` }}
              />
            </div>
          </div>
        ) : null}
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden" aria-label="Sections">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={section === item.id ? "page" : undefined}
              onClick={() => setSection(item.id)}
              className={`min-h-11 shrink-0 rounded-md px-3 text-sm ${section === item.id ? "bg-accent text-accent-ink" : "text-muted"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <div className="md:grid md:grid-cols-[13.5rem_minmax(0,1fr)]">
        <nav className="hidden border-r border-line md:block" aria-label="Sections">
          <ul className="sticky top-24 space-y-1 p-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => setSection(item.id)}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-sm ${active ? "bg-raised text-accent" : "text-muted hover:text-fg"}`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <main className="min-w-0 px-4 py-5 md:px-6 md:py-6">
          {!hydrated ? (
            <p className="text-sm text-muted">Reading laboratory records stored in this browser.</p>
          ) : (
            <SectionBody section={section} selectedId={selectedId} onSelect={setSelectedId} onNavigate={setSection} />
          )}
        </main>
      </div>
    </div>
  );
}
