import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware.ts";
import { getSql } from "../db.ts";

const reportInput = z.object({ playerId: z.string().min(1), type: z.string().min(1), severity: z.enum(["low","medium","high","critical"]) });
const idInput = z.object({ id: z.string().min(1) });
const noteInput = z.object({ id: z.string().min(1), note: z.string().min(1) });

function newId() { return `anom_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }

export const listAnomaliesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async () => {
  const sql = await getSql();
  const rows = await sql`select * from vanta_anomalies order by created_at desc`;
  return rows as unknown as { id: string }[];
});
export const reportAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(reportInput).handler(async ({ data }) => {
  const sql = await getSql();
  const id = newId();
  await sql`insert into vanta_anomalies (id, player_id, type, severity) values (${id}, ${data.playerId}, ${data.type}, ${data.severity})`;
  return { id };
});
export const investigateAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(idInput).handler(async ({ data }) => {
  const sql = await getSql();
  const rows = await sql`update vanta_anomalies set status='investigating' where id=${data.id} and status='open' returning id`;
  if (rows.length === 0) throw new Error("Investigate failed.");
  return { ok: true };
});
export const dismissAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(noteInput).handler(async ({ data }) => {
  const sql = await getSql();
  const rows = await sql`update vanta_anomalies set status='dismissed', notes = notes || ${JSON.stringify([data.note])}::jsonb where id=${data.id} returning id`;
  if (rows.length === 0) throw new Error("Dismiss failed.");
  return { ok: true };
});
export const confirmAnomalyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(noteInput).handler(async ({ data }) => {
  const sql = await getSql();
  const rows = await sql`update vanta_anomalies set status='confirmed', notes = notes || ${JSON.stringify([data.note])}::jsonb where id=${data.id} returning id`;
  if (rows.length === 0) throw new Error("Confirm failed.");
  return { ok: true };
});
