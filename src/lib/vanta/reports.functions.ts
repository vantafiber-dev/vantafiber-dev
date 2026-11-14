import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware.ts";
import { getSql } from "../db.ts";

const createInput = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  category: z.string().min(1).default("report"),
});

const idInput = z.object({ id: z.string().min(1) });
const evidenceInput = z.object({ id: z.string().min(1), note: z.string().min(1) });
const resolveInput = z.object({ id: z.string().min(1), resolution: z.string().min(1) });
const appealInput = z.object({ id: z.string().min(1), reason: z.string().min(1) });

function newId() {
  return `case_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const listReportsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql`select * from vanta_reports where player_id = ${context.userId} or claimed_by = ${context.userId} order by created_at desc`;
    return rows as unknown as { id: string }[];
  });

export const createReportFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const id = newId();
    await sql`insert into vanta_reports (id, player_id, category, subject, body) values (${id}, ${context.userId}, ${data.category}, ${data.subject}, ${data.body})`;
    return { id };
  });

export const claimReportFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(idInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const rows = await sql`update vanta_reports set status='claimed', claimed_by=${context.userId} where id=${data.id} and status='open' returning id`;
    if (rows.length === 0) throw new Error("Claim failed: case not open or already claimed.");
    await sql`insert into vanta_audit (actor, action, target, detail) values (${context.userId}, 'claim', ${data.id}, 'claimed')`;
    return { ok: true };
  });

export const addEvidenceFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(evidenceInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const rows = await sql`update vanta_reports set status='evidence', evidence = evidence || ${JSON.stringify([data.note])}::jsonb where id=${data.id} and claimed_by=${context.userId} and status in ('claimed','evidence') returning id`;
    if (rows.length === 0) throw new Error("Evidence failed: not assigned or invalid state.");
    await sql`insert into vanta_audit (actor, action, target, detail) values (${context.userId}, 'evidence', ${data.id}, ${data.note})`;
    return { ok: true };
  });

export const resolveReportFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(resolveInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const rows = await sql`update vanta_reports set status='resolved', resolution=${data.resolution} where id=${data.id} and claimed_by=${context.userId} and status in ('claimed','evidence') returning id`;
    if (rows.length === 0) throw new Error("Resolve failed: not assigned or invalid state.");
    await sql`insert into vanta_audit (actor, action, target, detail) values (${context.userId}, 'resolve', ${data.id}, ${data.resolution})`;
    return { ok: true };
  });

export const appealReportFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(appealInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const rows = await sql`update vanta_reports set status='appealed', appeal=${data.reason} where id=${data.id} and player_id=${context.userId} and status='resolved' returning id`;
    if (rows.length === 0) throw new Error("Appeal failed: not owner or not resolved.");
    await sql`insert into vanta_audit (actor, action, target, detail) values (${context.userId}, 'appeal', ${data.id}, ${data.reason})`;
    return { ok: true };
  });
