export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export type AnomalyStatus = "open" | "investigating" | "dismissed" | "confirmed";

export type Anomaly = {
  id: string;
  playerId: string;
  type: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  createdAt: string;
  notes: string[];
};

export type AntiCheatStore = {
  list: () => Anomaly[];
  report: (playerId: string, type: string, severity: AnomalySeverity) => Anomaly;
  investigate: (id: string) => boolean;
  dismiss: (id: string, note: string) => boolean;
  confirm: (id: string, note: string) => boolean;
};

let counter = 0;

export function createAntiCheatStore(): AntiCheatStore {
  const anomalies: Anomaly[] = [];

  return {
    list: () => [...anomalies],
    report: (playerId, type, severity) => {
      const a: Anomaly = {
        id: `anom_${++counter}`,
        playerId,
        type,
        severity,
        status: "open",
        createdAt: new Date().toISOString(),
        notes: [],
      };
      anomalies.unshift(a);
      return a;
    },
    investigate: (id) => {
      const a = anomalies.find((x) => x.id === id);
      if (!a || a.status !== "open") return false;
      a.status = "investigating";
      return true;
    },
    dismiss: (id, note) => {
      const a = anomalies.find((x) => x.id === id);
      if (!a) return false;
      a.status = "dismissed";
      a.notes.push(note);
      return true;
    },
    confirm: (id, note) => {
      const a = anomalies.find((x) => x.id === id);
      if (!a) return false;
      a.status = "confirmed";
      a.notes.push(note);
      return true;
    },
  };
}
