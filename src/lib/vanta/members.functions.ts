import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware.ts";
import { getSql } from "../db.ts";

const createTribeInput = z.object({ name: z.string().min(1), region: z.string().min(1), motto: z.string().min(1) });
const joinInput = z.object({ memberId: z.string().min(1), tribeId: z.string().min(1) });
const leaveInput = z.object({ memberId: z.string().min(1) });
const roleInput = z.object({ memberId: z.string().min(1), role: z.enum(["member","officer","leader"]) });
const repInput = z.object({ memberId: z.string().min(1), delta: z.number() });

function newId(prefix: string) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }

export const listTribesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async () => {
  const sql = await getSql();
  return (await sql`select * from vanta_tribes order by created_at desc`) as unknown as { id: string }[];
});
export const ensureMemberFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await getSql();
  const rows = await sql`select id from vanta_members where id=${context.userId}`;
  if (rows.length === 0) {
    await sql`insert into vanta_members (id, handle) values (${context.userId}, ${context.userId})`;
  }
  return { id: context.userId };
});

export const listMembersFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async () => {
  const sql = await getSql();
  return (await sql`select * from vanta_members order by joined_at desc`) as unknown as { id: string }[];
});
export const createTribeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(createTribeInput).handler(async ({ data }) => {
  const sql = await getSql();
  const id = newId("tribe");
  await sql`insert into vanta_tribes (id, name, region, motto) values (${id}, ${data.name}, ${data.region}, ${data.motto})`;
  return { id };
});
export const joinTribeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(joinInput).handler(async ({ data }) => {
  const sql = await getSql();
  const rows = await sql`update vanta_members set tribe_id=${data.tribeId}, role='member' where id=${data.memberId} returning id`;
  if (rows.length === 0) throw new Error("Join failed.");
  return { ok: true };
});
export const leaveTribeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(leaveInput).handler(async ({ data }) => {
  const sql = await getSql();
  const rows = await sql`update vanta_members set tribe_id=null, role='member' where id=${data.memberId} returning id`;
  if (rows.length === 0) throw new Error("Leave failed.");
  return { ok: true };
});
export const setRoleFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(roleInput).handler(async ({ data }) => {
  const sql = await getSql();
  const rows = await sql`update vanta_members set role=${data.role} where id=${data.memberId} returning id`;
  if (rows.length === 0) throw new Error("Set role failed.");
  return { ok: true };
});
export const reputationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(repInput).handler(async ({ data }) => {
  const sql = await getSql();
  const rows = await sql`update vanta_members set reputation = reputation + ${data.delta} where id=${data.memberId} returning reputation`;
  if (rows.length === 0) throw new Error("Reputation failed.");
  return { reputation: (rows[0] as { reputation: number }).reputation };
});
