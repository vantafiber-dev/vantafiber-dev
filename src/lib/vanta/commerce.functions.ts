import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware.ts";
import { getSql } from "../db.ts";

const pledgeInput = z.object({ tierId: z.string().min(1), amountUsd: z.number().positive() });
const realmInput = z.object({ tribeName: z.string().min(1), region: z.string().min(1) });

function newId(p: string) { return `${p}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }

export const listPledgesFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await getSql();
  return (await sql`select * from vanta_pledges where player_id=${context.userId} order by created_at desc`) as unknown as { id: string }[];
});
export const pledgeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(pledgeInput).handler(async ({ data, context }) => {
  const sql = await getSql();
  const id = newId("pledge");
  await sql`insert into vanta_pledges (id, player_id, tier_id, amount_usd) values (${id}, ${context.userId}, ${data.tierId}, ${data.amountUsd})`;
  return { id };
});
export const listRealmRequestsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await getSql();
  return (await sql`select * from vanta_realm_requests where player_id=${context.userId} order by created_at desc`) as unknown as { id: string }[];
});
export const requestRealmFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(realmInput).handler(async ({ data, context }) => {
  const sql = await getSql();
  const id = newId("realm");
  await sql`insert into vanta_realm_requests (id, player_id, tribe_name, region) values (${id}, ${context.userId}, ${data.tribeName}, ${data.region})`;
  return { id };
});
