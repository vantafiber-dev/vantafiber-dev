export type ReportStatus = "open" | "claimed" | "evidence" | "resolved" | "appealed";

export type ReportCase = {
  id: string;
  playerId: string;
  category: string;
  subject: string;
  body: string;
  createdAt: string;
  status: ReportStatus;
  claimedBy?: string;
  evidence: string[];
  resolution?: string;
  appeal?: string;
};

export type ReportStore = {
  list: () => ReportCase[];
  create: (input: { playerId: string; category: string; subject: string; body: string }) => ReportCase;
  claim: (id: string, moderatorId: string) => boolean;
  addEvidence: (id: string, note: string) => boolean;
  resolve: (id: string, resolution: string) => boolean;
  appeal: (id: string, reason: string) => boolean;
};

let counter = 0;

export function createReportStore(): ReportStore {
  const cases: ReportCase[] = [];

  return {
    list: () => [...cases],
    create: (input) => {
      const c: ReportCase = {
        id: `case_${++counter}`,
        playerId: input.playerId,
        category: input.category,
        subject: input.subject,
        body: input.body,
        createdAt: new Date().toISOString(),
        status: "open",
        evidence: [],
      };
      cases.unshift(c);
      return c;
    },
    claim: (id, moderatorId) => {
      const c = cases.find((x) => x.id === id);
      if (!c || c.status !== "open") return false;
      c.claimedBy = moderatorId;
      c.status = "claimed";
      return true;
    },
    addEvidence: (id, note) => {
      const c = cases.find((x) => x.id === id);
      if (!c || (c.status !== "claimed" && c.status !== "evidence")) return false;
      c.evidence.push(note);
      c.status = "evidence";
      return true;
    },
    resolve: (id, resolution) => {
      const c = cases.find((x) => x.id === id);
      if (!c || (c.status !== "evidence" && c.status !== "claimed")) return false;
      c.resolution = resolution;
      c.status = "resolved";
      return true;
    },
    appeal: (id, reason) => {
      const c = cases.find((x) => x.id === id);
      if (!c || c.status !== "resolved") return false;
      c.appeal = reason;
      c.status = "appealed";
      return true;
    },
  };
}
