export type AuditEntry = {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
  detail?: string;
};

export type AuditLog = {
  entries: () => AuditEntry[];
  record: (actor: string, action: string, target: string, detail?: string) => AuditEntry;
  forTarget: (target: string) => AuditEntry[];
};

let counter = 0;

export function createAuditLog(): AuditLog {
  const entries: AuditEntry[] = [];

  return {
    entries: () => [...entries],
    record: (actor, action, target, detail) => {
      const e: AuditEntry = { id: `audit_${++counter}`, actor, action, target, createdAt: new Date().toISOString(), detail };
      entries.unshift(e);
      return e;
    },
    forTarget: (target) => entries.filter((e) => e.target === target),
  };
}
