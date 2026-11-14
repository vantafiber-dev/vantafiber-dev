import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware.ts";
import { getSql } from "../db.ts";

const lfgInput = z.object({ region: z.string().min(1), mode: z.string().min(1), title: z.string().min(1), note: z.string().min(1) });
const ticketInput = z.object({ category: z.string().min(1), subject: z.string().min(1), body: z.string().min(1) });
const idInput = z.object({ id: z.string().min(1) });

function newId(p: string) { return `${p}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }

export const listLfgFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async () => {
  const sql = await getSql();
  return (await sql`select * from vanta_lfg_posts order by created_at desc`) as unknown as { id: string }[];
});
export const createLfgFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(lfgInput).handler(async ({ data, context }) => {
  const sql = await getSql();
  const id = newId("lfg");
  await sql`insert into vanta_lfg_posts (id, player_id, region, mode, title, note) values (${id}, ${context.userId}, ${data.region}, ${data.mode}, ${data.title}, ${data.note})`;
  return { id };
});
export const closeLfgFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(idInput).handler(async ({ data, context }) => {
  const sql = await getSql();
  const rows = await sql`update vanta_lfg_posts set status='closed' where id=${data.id} and player_id=${context.userId} returning id`;
  if (rows.length === 0) throw new Error("Close failed.");
  return { ok: true };
});
export const listTicketsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await getSql();
  return (await sql`select * from vanta_tickets where player_id=${context.userId} order by created_at desc`) as unknown as { id: string }[];
});
export const createTicketFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(ticketInput).handler(async ({ data, context }) => {
  const sql = await getSql();
  const id = newId("ticket");
  await sql`insert into vanta_tickets (id, player_id, category, subject, body) values (${id}, ${context.userId}, ${data.category}, ${data.subject}, ${data.body})`;
  return { id };
});
export const resolveTicketFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(idInput).handler(async ({ data }) => {
  const sql = await getSql();
  const rows = await sql`update vanta_tickets set status='resolved' where id=${data.id} returning id`;
  if (rows.length === 0) throw new Error("Resolve failed.");
  return { ok: true };
});
