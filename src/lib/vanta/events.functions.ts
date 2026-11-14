import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware.ts";
import { getSql } from "../db.ts";

const regInput = z.object({ eventId: z.string().min(1), tribeId: z.string().optional() });

export const listEventsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async () => {
  const sql = await getSql();
  return (await sql`select * from vanta_events order by starts_at asc`) as unknown as { id: string }[];
});
export const registerEventFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(regInput).handler(async ({ data, context }) => {
  const sql = await getSql();
  const ev = await sql`select capacity, status from vanta_events where id=${data.eventId}`;
  if (ev.length === 0) throw new Error("Unknown event.");
  if ((ev[0] as { status: string }).status !== "open") throw new Error("Event not open.");
  const seats = await sql`select count(*)::int as c from vanta_event_registrations where event_id=${data.eventId} and status='registered'`;
  const capacity = (ev[0] as { capacity: number }).capacity;
  const taken = (seats[0] as { c: number }).c;
  const status = taken < capacity ? "registered" : "waitlisted";
  await sql`insert into vanta_event_registrations (event_id, player_id, tribe_id, status) values (${data.eventId}, ${context.userId}, ${data.tribeId ?? null}, ${status}) on conflict (event_id, player_id) do nothing`;
  return { status };
});
export const checkInEventFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(z.object({ eventId: z.string().min(1) })).handler(async ({ data, context }) => {
  const sql = await getSql();
  const rows = await sql`update vanta_event_registrations set status='checked_in' where event_id=${data.eventId} and player_id=${context.userId} and status='registered' returning status`;
  if (rows.length === 0) throw new Error("Check-in failed.");
  await sql`update vanta_events set status='in_progress' where id=${data.eventId} and status='open'`;
  return { status: "checked_in" };
});
