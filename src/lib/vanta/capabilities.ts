export const CAPABILITY_STATUSES = [
  "verified",
  "proven_sandbox",
  "requires_xbox_test",
  "requires_provider_approval",
  "manual_fallback",
  "unsupported",
  "prohibited",
] as const;

export type CapabilityStatus = (typeof CAPABILITY_STATUSES)[number];

export const CAPABILITY_STATUS_LABELS: Record<CapabilityStatus, string> = {
  verified: "Verified now",
  proven_sandbox: "Proven in sandbox",
  requires_xbox_test: "Requires Xbox server test",
  requires_provider_approval: "Requires provider approval",
  manual_fallback: "Manual fallback",
  unsupported: "Unsupported",
  prohibited: "Prohibited",
};

export type Capability = {
  id: string;
  label: string;
  status: CapabilityStatus;
  detail?: string;
};

export const INITIAL_CAPABILITIES: Capability[] = [
  {
    id: "join.waitlist",
    label: "Public waitlist capture (local demo store)",
    status: "manual_fallback",
    detail: "Local browser demo store until the durable waitlist backend is provisioned.",
  },
  {
    id: "join.how-to-play",
    label: "How-to-join instructions for Xbox + Windows Store clients",
    status: "requires_xbox_test",
    detail: "Written guidance drafts only; actual join path verified on real clients at launch.",
  },
  {
    id: "server.status",
    label: "Live server status board",
    status: "requires_xbox_test",
    detail: "No hosting capacity purchased yet; public board shows placeholder states.",
  },
  {
    id: "config.prototype",
    label: "Xbox ASE Game.ini / GameUserSettings.ini prototype profiles",
    status: "manual_fallback",
    detail: "Local config lint + diff tooling; live engine behaviour unverified.",
  },
  {
    id: "provider.nitrado.adapter",
    label: "Nitrado Xbox ASE provider adapter",
    status: "requires_provider_approval",
    detail: "Adapter implemented against documented surface; live calls gated on owner credentials.",
  },
  {
    id: "commerce.checkout",
    label: "Hosted payment checkout + fulfilment",
    status: "prohibited",
    detail: "Disabled pending Microsoft/Xbox Services Agreement, Wildcard, Nitrado, Discord and legal review.",
  },
  {
    id: "anti_cheat.ban",
    label: "Automatic permanent ban enforcement",
    status: "manual_fallback",
    detail: "Detection families designed for authorised telemetry only; severe bans need human sign-off.",
  },
];

export function isCapabilityStatus(value: unknown): value is CapabilityStatus {
  return (
    typeof value === "string" &&
    (CAPABILITY_STATUSES as readonly string[]).includes(value)
  );
}

export function capabilityLabel(status: CapabilityStatus): string {
  return CAPABILITY_STATUS_LABELS[status] ?? status;
}
