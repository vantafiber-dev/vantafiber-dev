import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { applyFamily, clearHalt, isHalted, programmeSpecs, requestHalt, runSpec, specById } from "./experiments.ts";
import { makeReviews } from "./review.ts";
import { runSelfTests } from "./selftest.ts";
import type { ExperimentRecord, LabSettings, LogEntry, SelfTest } from "./types.ts";

export interface Progress {
  label: string;
  done: number;
  total: number;
}

interface LabStore {
  runs: ExperimentRecord[];
  selfTests: SelfTest[];
  settings: LabSettings;
  logs: LogEntry[];
  running: boolean;
  progress: Progress | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setSettings: (patch: Partial<LabSettings>) => void;
  stop: () => void;
  runIds: (ids: string[]) => Promise<void>;
  runSelf: () => Promise<void>;
  clearAll: () => void;
}

const defaultSettings: LabSettings = {
  trials: 6,
  steps: 40,
  reducedMotion: false,
  autonomy: "manual",
};

function append(logs: LogEntry[], level: LogEntry["level"], message: string): LogEntry[] {
  return [...logs, { at: new Date().toISOString(), level, message }].slice(-160);
}

function trim(runs: ExperimentRecord[]): ExperimentRecord[] {
  const kept = runs.slice(-24);
  const replayFrom = Math.max(0, kept.length - 8);
  return kept.map((run, index) => (index < replayFrom ? { ...run, replay: null } : run));
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const browserStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Quota is a recorded engineering limit, not a scientific result. */
    }
  },
  removeItem: (key: string) => localStorage.removeItem(key),
};

export const useLab = create<LabStore>()(
  persist(
    (set, get) => ({
      runs: [],
      selfTests: [],
      settings: defaultSettings,
      logs: [],
      running: false,
      progress: null,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      stop: () => {
        requestHalt();
        set({ logs: append(get().logs, "stop", "Stop requested. The current trial will finish, then the queue halts.") });
      },
      clearAll: () => {
        clearHalt();
        set({
          runs: [],
          selfTests: [],
          logs: append([], "warn", "Laboratory records cleared from this browser."),
          progress: null,
          running: false,
        });
      },
      runSelf: async () => {
        if (get().running) return;
        set({ running: true, progress: { label: "Known-answer tests", done: 0, total: 1 }, logs: append(get().logs, "info", "Running instrument self-tests.") });
        try {
          const selfTests = await runSelfTests();
          const failed = selfTests.filter((t) => !t.passed).length;
          set({
            selfTests,
            logs: append(get().logs, failed ? "error" : "info", `Self-tests finished. ${selfTests.length - failed} passed, ${failed} failed.`),
          });
        } finally {
          set({ running: false, progress: null });
        }
      },
      runIds: async (ids) => {
        if (get().running) return;
        clearHalt();
        const settings = get().settings;
        const cores = typeof navigator === "undefined" ? null : navigator.hardwareConcurrency;
        const userAgent = typeof navigator === "undefined" ? "unknown" : navigator.userAgent;
        set({
          running: true,
          progress: { label: "Queue", done: 0, total: ids.length },
          logs: append(get().logs, "info", `Queued ${ids.length} specification${ids.length === 1 ? "" : "s"} · ${settings.trials} trials · ${settings.steps} steps.`),
        });
        const fresh: ExperimentRecord[] = [];
        try {
          for (let i = 0; i < ids.length; i++) {
            if (isHalted()) break;
            const spec = specById(ids[i]);
            if (!spec) continue;
            const rec = await runSpec(
              spec,
              { trials: settings.trials, steps: settings.steps, cores, userAgent },
              (label) => set({ progress: { label, done: i, total: ids.length } }),
            );
            fresh.push(rec);
            set({ progress: { label: spec.title, done: i + 1, total: ids.length } });
          }
          const adjusted = applyFamily(fresh).map((record) => ({ ...record, reviews: makeReviews(record) }));
          const stopped = isHalted();
          set({
            runs: trim([...get().runs, ...adjusted]),
            logs: append(
              get().logs,
              stopped ? "stop" : "info",
              stopped
                ? `Halted. Stored ${adjusted.length} partial or finished records.`
                : `Stored ${adjusted.length} records. Claims use only those trials.`,
            ),
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          set({ logs: append(get().logs, "error", `Runner error: ${message}`) });
        } finally {
          clearHalt();
          set({ running: false, progress: null });
        }
      },
    }),
    {
      name: "omeil-lab-v1",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage : browserStorage)),
      partialize: (state) => ({
        runs: state.runs,
        selfTests: state.selfTests,
        settings: state.settings,
        logs: state.logs,
      }),
    },
  ),
);

export function allSpecIds(): string[] {
  return programmeSpecs().map((spec) => spec.id);
}

export function confirmatoryIds(): string[] {
  return programmeSpecs()
    .filter((spec) => spec.confirmatory)
    .map((spec) => spec.id);
}

export function instrumentIds(): string[] {
  return programmeSpecs()
    .filter((spec) => spec.knownAs === "instrument")
    .map((spec) => spec.id);
}
