export type PledgeTier = {
  id: string;
  name: string;
  amountUsd: number;
  perks: string[];
  cap?: number;
};

export type Pledge = {
  id: string;
  playerId: string;
  tierId: string;
  amountUsd: number;
  createdAt: string;
  status: "pending" | "confirmed" | "refunded";
};

export type CheckoutResult = { ok: true; pledge: Pledge } | { ok: false; error: string };

export type RealmRequest = {
  id: string;
  playerId: string;
  tribeName: string;
  region: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

export const PLEDGE_TIERS: PledgeTier[] = [
  { id: "supporter", name: "Supporter", amountUsd: 5, perks: ["Discord role", "Name in credits"] },
  { id: "founder", name: "Founder", amountUsd: 25, perks: ["Supporter perks", "Founder badge", "Early access"] },
  { id: "patron", name: "Patron", amountUsd: 100, perks: ["Founder perks", "Private realm invite", "Creator shoutout"] },
];

export type CommerceStore = {
  tiers: () => PledgeTier[];
  pledges: () => Pledge[];
  pledge: (playerId: string, tierId: string) => CheckoutResult;
  refund: (pledgeId: string) => boolean;
  realmRequests: () => RealmRequest[];
  requestRealm: (playerId: string, tribeName: string, region: string) => RealmRequest;
  approveRealm: (id: string) => boolean;
};

let pledgeCounter = 0;
let realmCounter = 0;

export function createCommerceStore(): CommerceStore {
  const pledges: Pledge[] = [];
  const realmRequests: RealmRequest[] = [];

  return {
    tiers: () => [...PLEDGE_TIERS],
    pledges: () => [...pledges],
    pledge: (playerId, tierId) => {
      const tier = PLEDGE_TIERS.find((t) => t.id === tierId);
      if (!tier) return { ok: false, error: "Unknown tier." };
      const p: Pledge = {
        id: `pledge_${++pledgeCounter}`,
        playerId,
        tierId,
        amountUsd: tier.amountUsd,
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      pledges.unshift(p);
      return { ok: true, pledge: p };
    },
    refund: (pledgeId) => {
      const p = pledges.find((x) => x.id === pledgeId);
      if (!p) return false;
      p.status = "refunded";
      return true;
    },
    realmRequests: () => [...realmRequests],
    requestRealm: (playerId, tribeName, region) => {
      const r: RealmRequest = {
        id: `realm_${++realmCounter}`,
        playerId,
        tribeName,
        region,
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      realmRequests.unshift(r);
      return r;
    },
    approveRealm: (id) => {
      const r = realmRequests.find((x) => x.id === id);
      if (!r) return false;
      r.status = "approved";
      return true;
    },
  };
}
