export type WipeStepStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export type WipeStep = {
  id: string;
  label: string;
  status: WipeStepStatus;
  detail?: string;
};

export type WipeRehearsal = {
  id: string;
  startedAt: string;
  finishedAt?: string;
  steps: WipeStep[];
  overall: "pending" | "passed" | "failed";
};

const DEFAULT_STEPS: Omit<WipeStep, "status">[] = [
  { id: "backup", label: "Snapshot current server state" },
  { id: "announce", label: "Announce wipe window to members" },
  { id: "kick", label: "Kick active players" },
  { id: "wipe_save", label: "Wipe save files" },
  { id: "restore_config", label: "Restore compiled config" },
  { id: "restart", label: "Restart server" },
  { id: "verify", label: "Verify server health and config checksum" },
  { id: "reopen", label: "Reopen to players" },
];

export function createWipeRehearsal(): WipeRehearsal {
  return {
    id: `wipe_${Date.now()}`,
    startedAt: new Date().toISOString(),
    steps: DEFAULT_STEPS.map((s) => ({ ...s, status: "pending" })),
    overall: "pending",
  };
}

export function runWipeRehearsal(rehearsal: WipeRehearsal, failAt?: string): WipeRehearsal {
  for (const step of rehearsal.steps) {
    step.status = "running";
    if (failAt && step.id === failAt) {
      step.status = "failed";
      step.detail = "Simulated failure for rehearsal.";
      rehearsal.overall = "failed";
      rehearsal.finishedAt = new Date().toISOString();
      // mark remaining pending
      return rehearsal;
    }
    step.status = "passed";
    step.detail = "Fixture mode: step completed.";
  }
  rehearsal.overall = "passed";
  rehearsal.finishedAt = new Date().toISOString();
  return rehearsal;
}

export function rehearsalSummary(r: WipeRehearsal): string {
  const passed = r.steps.filter((s) => s.status === "passed").length;
  const failed = r.steps.filter((s) => s.status === "failed").length;
  return `${passed}/${r.steps.length} steps passed, ${failed} failed. Overall: ${r.overall}.`;
}
