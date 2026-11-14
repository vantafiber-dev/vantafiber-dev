export type EventFormat = "arena" | "scrimmage" | "tribal" | "community";

export type EventStatus = "draft" | "open" | "full" | "in_progress" | "completed" | "cancelled";

export type GameEvent = {
  id: string;
  slug: string;
  title: string;
  format: EventFormat;
  status: EventStatus;
  startsAtUtc: string;
  endsAtUtc: string;
  capacity: number;
  region: string;
  host: string;
  rulesVersion: string;
};

export type EventRegistrationStatus = "registered" | "waitlisted" | "cancelled" | "checked_in";

export type EventRegistration = {
  eventId: string;
  playerId: string;
  tribeId?: string;
  status: EventRegistrationStatus;
  registeredAt: string;
};

export type EventRegistrationResult =
  | { ok: true; registration: EventRegistration; waitlisted: boolean }
  | { ok: false; error: string };

export type EventStore = {
  list: () => GameEvent[];
  get: (id: string) => GameEvent | undefined;
  register: (input: { eventId: string; playerId: string; tribeId?: string }) => EventRegistrationResult;
  cancel: (eventId: string, playerId: string) => void;
  checkIn: (eventId: string, playerId: string) => { ok: true; status: EventRegistrationStatus } | { ok: false; error: string };
};

const initialEvents: GameEvent[] = [
  {
    id: "evt_season_zero_raid_clock",
    slug: "season-zero-raid-clock",
    title: "Season Zero Raid Clock - Opening Night",
    format: "arena",
    status: "open",
    startsAtUtc: "2026-12-05T02:00:00.000Z",
    endsAtUtc: "2026-12-05T06:00:00.000Z",
    capacity: 32,
    region: "Australia (AU)",
    host: "Vanta Fiber staff",
    rulesVersion: "season-zero-rules-v1",
  },
  {
    id: "evt_founder_clash",
    slug: "founder-clash",
    title: "Founder Clash - Creator Event",
    format: "tribal",
    status: "draft",
    startsAtUtc: "2026-12-19T03:00:00.000Z",
    endsAtUtc: "2026-12-19T09:00:00.000Z",
    capacity: 16,
    region: "Europe (EU)",
    host: "Vanta Fiber creators",
    rulesVersion: "season-zero-rules-v1",
  },
];

function seedRegistrations(): EventRegistration[] {
  return [
    {
      eventId: "evt_season_zero_raid_clock",
      playerId: "player_seed_1",
      tribeId: "tribe_seed_1",
      status: "registered",
      registeredAt: "2026-11-01T00:00:00.000Z",
    },
  ];
}

export function createEventStore() {
  const events = [...initialEvents];
  const registrations = [...seedRegistrations()];

  return {
    registrations,
    list: () => events,
    get: (id: string) => events.find((e) => e.id === id),
    register: ({ eventId, playerId, tribeId }: { eventId: string; playerId: string; tribeId?: string }) => {
      const ev = events.find((e) => e.id === eventId);
      if (!ev) return { ok: false, error: "Unknown event." };
      if (ev.status !== "open") return { ok: false, error: "Event is not open for registration." };
      const existing = registrations.find((r) => r.eventId === eventId && r.playerId === playerId);
      if (existing && existing.status !== "cancelled") {
        return { ok: false, error: "Player already has a registration." };
      }
      const seatsTaken = registrations.filter(
        (r) => r.eventId === eventId && r.status === "registered",
      ).length;
      const registered = seatsTaken < ev.capacity;
      const registration: EventRegistration = {
        eventId,
        playerId,
        tribeId,
        status: registered ? "registered" : "waitlisted",
        registeredAt: new Date().toISOString(),
      };
      registrations.push(registration);
      return { ok: true, registration, waitlisted: !registered };
    },
    cancel: (eventId: string, playerId: string) => {
      const reg = registrations.find((r) => r.eventId === eventId && r.playerId === playerId);
      if (reg) reg.status = "cancelled";
    },
    checkIn: (eventId: string, playerId: string) => {
      const reg = registrations.find((r) => r.eventId === eventId && r.playerId === playerId);
      if (!reg) return { ok: false, error: "Player is not registered for this event." };
      if (reg.status !== "registered") return { ok: false, error: "Only registered players can check in." };
      reg.status = "checked_in";
      const ev = events.find((e) => e.id === eventId);
      if (ev && ev.status === "open") ev.status = "in_progress";
      return { ok: true, status: reg.status };
    },
  };
}
