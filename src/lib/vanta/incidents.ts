export type IncidentStatus = "open" | "mitigating" | "resolved";

export type Incident = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: IncidentStatus;
  startedAt: string;
  resolvedAt?: string;
  notes: string[];
};

export type IncidentStore = {
  list: () => Incident[];
  open: (title: string, severity: Incident["severity"]) => Incident;
  mitigate: (id: string, note: string) => boolean;
  resolve: (id: string, note: string) => boolean;
};

let counter = 0;

export function createIncidentStore(): IncidentStore {
  const incidents: Incident[] = [];

  return {
    list: () => [...incidents],
    open: (title, severity) => {
      const i: Incident = { id: `inc_${++counter}`, title, severity, status: "open", startedAt: new Date().toISOString(), notes: [] };
      incidents.unshift(i);
      return i;
    },
    mitigate: (id, note) => {
      const i = incidents.find((x) => x.id === id);
      if (!i) return false;
      i.status = "mitigating";
      i.notes.push(note);
      return true;
    },
    resolve: (id, note) => {
      const i = incidents.find((x) => x.id === id);
      if (!i) return false;
      i.status = "resolved";
      i.resolvedAt = new Date().toISOString();
      i.notes.push(note);
      return true;
    },
  };
}
