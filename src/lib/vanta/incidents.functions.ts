import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware.ts";
import { getSql } from "../db.ts";

const openInput = z.object({ title: z.string().min(1), severity: z.enum(["low","medium","high","critical"]) });
const idInput = z.object({ id: z.string().min(1) });
const noteInput = z.object({ id: z.string().min(1), note: z.string().min(1) });

function newId() { return `inc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

export const listIncidentsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql`select * from vanta_incidents order by started_at desc`;
    return rows as unknown as { id: string }[];
  });

export const openIncidentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(openInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = newId();
    await sql`insert into vanta_incidents (id, title, severity) values (${id}, ${data.title}, ${data.severity})`;
    return { id };
  });

export const mitigateIncidentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(noteInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`update vanta_incidents set status='mitigating', notes = notes || ${JSON.stringify([data.note])}::jsonb where id=${data.id} returning id`;
    if (rows.length === 0) throw new Error("Mitigate failed.");
    return { ok: true };
  });

export const resolveIncidentFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(noteInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`update vanta_incidents set status='resolved', resolved_at=now(), notes = notes || ${JSON.stringify([data.note])}::jsonb where id=${data.id} returning id`;
    if (rows.length === 0) throw new Error("Resolve failed.");
    return { ok: true };
  });
