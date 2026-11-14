import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware.ts";
import { getSql } from "../db.ts";

const joinInput = z.object({ email: z.string().email(), platform: z.string().min(1), region: z.string().min(1), consent: z.boolean() });

function newId() { return `wl_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }

export const listWaitlistFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async () => {
  const sql = await getSql();
  return (await sql`select * from vanta_waitlist order by created_at desc`) as unknown as { id: string }[];
});
export const joinWaitlistFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(joinInput).handler(async ({ data }) => {
  if (!data.consent) throw new Error("Consent required.");
  const sql = await getSql();
  const id = newId();
  await sql`insert into vanta_waitlist (id, email, platform, region, consent) values (${id}, ${data.email}, ${data.platform}, ${data.region}, ${data.consent})`;
  return { id };
});
