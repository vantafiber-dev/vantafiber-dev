import { getSql } from "../db.ts";

export type DbReport = {
  id: string;
  player_id: string;
  category: string;
  subject: string;
  body: string;
  status: string;
  claimed_by: string | null;
  evidence: string[];
  resolution: string | null;
  appeal: string | null;
  created_at: string;
};

export async function listReports(): Promise<DbReport[]> {
  const sql = await getSql();
  return sql<DbReport>`select * from vanta_reports order by created_at desc`;
}

export async function createReport(input: {
  id: string;
  playerId: string;
  category: string;
  subject: string;
  body: string;
}): Promise<void> {
  const sql = await getSql();
  await sql`insert into vanta_reports (id, player_id, category, subject, body) values (${input.id}, ${input.playerId}, ${input.category}, ${input.subject}, ${input.body})`;
}

export async function claimReport(id: string, moderatorId: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`update vanta_reports set status='claimed', claimed_by=${moderatorId} where id=${id} and status='open' returning id`;
  return rows.length > 0;
}

export async function addReportEvidence(id: string, note: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`update vanta_reports set status='evidence', evidence = evidence || ${JSON.stringify([note])}::jsonb where id=${id} and status in ('claimed','evidence') returning id`;
  return rows.length > 0;
}

export async function resolveReport(id: string, resolution: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`update vanta_reports set status='resolved', resolution=${resolution} where id=${id} and status in ('claimed','evidence') returning id`;
  return rows.length > 0;
}

export async function appealReport(id: string, reason: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`update vanta_reports set status='appealed', appeal=${reason} where id=${id} and status='resolved' returning id`;
  return rows.length > 0;
}
