export type MemberRole = "member" | "officer" | "leader";

export type Tribe = {
  id: string;
  name: string;
  region: string;
  motto: string;
  createdAt: string;
};

export type MemberProfile = {
  id: string;
  handle: string;
  tribeId?: string;
  role: MemberRole;
  joinedAt: string;
  reputation: number;
};

export type MemberStore = {
  tribes: () => Tribe[];
  members: () => MemberProfile[];
  createTribe: (name: string, region: string, motto: string) => Tribe;
  joinTribe: (memberId: string, tribeId: string) => boolean;
  leaveTribe: (memberId: string) => boolean;
  setRole: (memberId: string, role: MemberRole) => boolean;
  reputation: (memberId: string, delta: number) => number;
};

let tribeCounter = 0;

export function createMemberStore(): MemberStore {
  const tribes: Tribe[] = [];
  const members: MemberProfile[] = [
    { id: "m_seed", handle: "seed_player", tribeId: undefined, role: "member", joinedAt: "2026-11-01T00:00:00.000Z", reputation: 0 },
  ];

  return {
    tribes: () => [...tribes],
    members: () => [...members],
    createTribe: (name, region, motto) => {
      const t: Tribe = { id: `tribe_${++tribeCounter}`, name, region, motto, createdAt: new Date().toISOString() };
      tribes.unshift(t);
      return t;
    },
    joinTribe: (memberId, tribeId) => {
      const m = members.find((x) => x.id === memberId);
      const t = tribes.find((x) => x.id === tribeId);
      if (!m || !t) return false;
      m.tribeId = tribeId;
      m.role = "member";
      return true;
    },
    leaveTribe: (memberId) => {
      const m = members.find((x) => x.id === memberId);
      if (!m) return false;
      m.tribeId = undefined;
      m.role = "member";
      return true;
    },
    setRole: (memberId, role) => {
      const m = members.find((x) => x.id === memberId);
      if (!m) return false;
      m.role = role;
      return true;
    },
    reputation: (memberId, delta) => {
      const m = members.find((x) => x.id === memberId);
      if (!m) return 0;
      m.reputation += delta;
      return m.reputation;
    },
  };
}
