import { makeRng, type Rng } from "./rng.ts";
import { binaryMutualInfo, gini, shannonEntropy } from "./stats.ts";
import type { Frame, Metrics, SeriesPoint, SimConfig, Strategy, TrialRecord } from "./types.ts";

export const BASE_CONFIG: SimConfig = {
  width: 28,
  height: 28,
  agents: 16,
  mix: { cooperator: 1, defector: 1, conditional: 1, forager: 1 },
  steps: 64,
  seed: 1,
  vision: 3,
  regen: 0.18,
  harvest: 0.22,
  metabolism: 0.015,
  share: 0.35,
  shareNoise: 0,
  temptation: 1,
  temptationEnd: 2,
  memory: 6,
  communication: false,
  signalNoise: 0,
  observability: "local",
  patches: 3,
  interactionRadius: 2.25,
  schedule: "none",
  solo: false,
  perturbation: null,
  removeAt: null,
};

const STRATEGIES: Strategy[] = ["cooperator", "defector", "conditional", "forager"];

export function normalizeConfig(partial: Partial<SimConfig> & { seed: number }): SimConfig {
  return {
    ...BASE_CONFIG,
    ...partial,
    mix: { ...BASE_CONFIG.mix, ...(partial.mix ?? {}) },
    perturbation: partial.perturbation === undefined ? BASE_CONFIG.perturbation : partial.perturbation,
    removeAt: partial.removeAt === undefined ? BASE_CONFIG.removeAt : partial.removeAt,
  };
}

interface Patch {
  x: number;
  y: number;
  amp: number;
  sigma: number;
}

interface Agent {
  id: number;
  x: number;
  y: number;
  strategy: Strategy;
  energy: number;
  alive: boolean;
  memory: number[];
  vx: number;
  vy: number;
  lastShared: boolean;
}

export interface SimState {
  cfg: SimConfig;
  stepIndex: number;
  agents: Agent[];
  grid: Float64Array;
  patches: Patch[];
  potential: Float64Array;
  totalHarvest: number;
  coopEvents: number;
  coopOpps: number;
  lateEvents: number;
  lateOpps: number;
  orderSum: number;
  moveCounts: number[];
  mi: [number, number, number, number];
  pairs: Map<string, number>;
  series: SeriesPoint[];
  frames: Frame[];
  energyTrace: number[];
  issues: string[];
  removed: boolean;
}

function wrap(v: number, n: number): number {
  return ((v % n) + n) % n;
}

function shortest(delta: number, n: number): number {
  let d = wrap(delta, n);
  if (d > n / 2) d -= n;
  return d;
}

function allocateMix(n: number, mix: Record<Strategy, number>): Strategy[] {
  const weights = STRATEGIES.map((s) => Math.max(0, mix[s] ?? 0));
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const exact = weights.map((w) => (n * w) / sum);
  const counts = exact.map((e) => Math.floor(e));
  let left = n - counts.reduce((a, b) => a + b, 0);
  const order = exact
    .map((e, i) => ({ i, frac: e - Math.floor(e) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; k < left; k++) counts[order[k % order.length].i]++;
  const out: Strategy[] = [];
  STRATEGIES.forEach((s, i) => {
    for (let k = 0; k < counts[i]; k++) out.push(s);
  });
  return out;
}

function makePatches(cfg: SimConfig, rng: Rng): Patch[] {
  const patches: Patch[] = [];
  const n = Math.max(1, cfg.patches);
  for (let i = 0; i < n; i++) {
    patches.push({
      x: rng() * cfg.width,
      y: rng() * cfg.height,
      amp: 0.72 + rng() * 0.5,
      sigma: 2.3 + rng() * 1.5,
    });
  }
  return patches;
}

function cellPotential(x: number, y: number, cfg: SimConfig, patches: Patch[]): number {
  let p = 0.045;
  for (const patch of patches) {
    const dx = shortest(patch.x - x, cfg.width);
    const dy = shortest(patch.y - y, cfg.height);
    p += patch.amp * Math.exp(-(dx * dx + dy * dy) / (2 * patch.sigma * patch.sigma));
  }
  return Math.min(1.15, p);
}

function buildPotential(cfg: SimConfig, patches: Patch[]): Float64Array {
  const pot = new Float64Array(cfg.width * cfg.height);
  for (let y = 0; y < cfg.height; y++) {
    for (let x = 0; x < cfg.width; x++) pot[y * cfg.width + x] = cellPotential(x, y, cfg, patches);
  }
  return pot;
}

interface InitAgent {
  id: number;
  x: number;
  y: number;
  strategy: Strategy;
}

function makeLayout(cfg: SimConfig, rng: Rng): InitAgent[] {
  const strategies = allocateMix(cfg.agents, cfg.mix);
  const used = new Set<number>();
  const inits: InitAgent[] = [];
  for (let i = 0; i < cfg.agents; i++) {
    let x = 0;
    let y = 0;
    let guard = 0;
    do {
      x = Math.floor(rng() * cfg.width);
      y = Math.floor(rng() * cfg.height);
      guard++;
    } while (used.has(y * cfg.width + x) && guard < cfg.width * cfg.height);
    used.add(y * cfg.width + x);
    inits.push({ id: i, x, y, strategy: strategies[i] ?? "forager" });
  }
  return inits;
}

function emptyState(cfg: SimConfig, patches: Patch[], layout: InitAgent[]): SimState {
  const potential = buildPotential(cfg, patches);
  const grid = new Float64Array(potential);
  return {
    cfg,
    stepIndex: 0,
    agents: layout.map((a) => ({
      id: a.id,
      x: a.x,
      y: a.y,
      strategy: a.strategy,
      energy: 1,
      alive: true,
      memory: [],
      vx: 0,
      vy: 0,
      lastShared: false,
    })),
    grid,
    patches,
    potential,
    totalHarvest: 0,
    coopEvents: 0,
    coopOpps: 0,
    lateEvents: 0,
    lateOpps: 0,
    orderSum: 0,
    moveCounts: new Array(9).fill(0),
    mi: [0, 0, 0, 0],
    pairs: new Map(),
    series: [],
    frames: [],
    energyTrace: [],
    issues: [],
    removed: false,
  };
}

export function createSim(partial: Partial<SimConfig> & { seed: number }): SimState {
  const cfg = normalizeConfig(partial);
  const patches = makePatches(cfg, makeRng(cfg.seed));
  const layout = makeLayout(cfg, makeRng(cfg.seed + 1));
  return emptyState(cfg, patches, layout);
}

function regenNow(sim: SimState): number {
  const { cfg, stepIndex } = sim;
  const half = Math.floor(cfg.steps / 2);
  if (cfg.schedule === "scarce-then-rich") return stepIndex < half ? cfg.regen * 0.22 : cfg.regen * 1.7;
  if (cfg.schedule === "rich-then-scarce") return stepIndex < half ? cfg.regen * 1.7 : cfg.regen * 0.22;
  if (cfg.perturbation && stepIndex >= cfg.perturbation.start && stepIndex < cfg.perturbation.end) {
    return cfg.perturbation.regen;
  }
  return cfg.regen;
}

function temptNow(sim: SimState): number {
  const { cfg, stepIndex } = sim;
  const span = Math.max(1, cfg.steps - 1);
  const a = stepIndex / span;
  if (cfg.schedule === "tempt-up") return 1 + a * (cfg.temptationEnd - 1);
  if (cfg.schedule === "tempt-down") return cfg.temptationEnd - a * (cfg.temptationEnd - 1);
  return cfg.temptation;
}

function neighborsOf(sim: SimState, agent: Agent): Agent[] {
  const r2 = sim.cfg.interactionRadius * sim.cfg.interactionRadius;
  const out: Agent[] = [];
  for (const other of sim.agents) {
    if (other.id === agent.id || !other.alive) continue;
    const dx = shortest(other.x - agent.x, sim.cfg.width);
    const dy = shortest(other.y - agent.y, sim.cfg.height);
    if (dx * dx + dy * dy <= r2) out.push(other);
  }
  return out;
}

function packGrid(grid: Float64Array): string {
  const bytes = new Uint8Array(grid.length);
  for (let i = 0; i < grid.length; i++) {
    const v = grid[i] / 1.5;
    bytes[i] = Math.max(0, Math.min(255, Math.round(v * 255)));
  }
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export function unpackGrid(encoded: string, length: number): Float64Array {
  const bin = atob(encoded);
  const out = new Float64Array(length);
  const n = Math.min(length, bin.length);
  for (let i = 0; i < n; i++) out[i] = (bin.charCodeAt(i) / 255) * 1.5;
  return out;
}

function recordFrame(sim: SimState, edges: [number, number][]) {
  sim.frames.push({
    t: sim.stepIndex,
    agents: sim.agents.map((a) => ({
      id: a.id,
      x: a.x,
      y: a.y,
      strategy: a.strategy,
      energy: round3(a.energy),
      alive: a.alive,
    })),
    resources: packGrid(sim.grid),
    edges: edges.slice(0, 48),
  });
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function stepSim(sim: SimState, rng: Rng) {
  const { cfg } = sim;
  if (cfg.removeAt && !sim.removed && sim.stepIndex === cfg.removeAt.step) {
    const kill = Math.floor(sim.agents.length * cfg.removeAt.fraction);
    const alive = sim.agents.filter((a) => a.alive).sort((a, b) => b.id - a.id);
    for (let i = 0; i < kill && i < alive.length; i++) {
      alive[i].alive = false;
      alive[i].energy = 0;
    }
    sim.removed = true;
  }

  const signals: { x: number; y: number; id: number }[] = [];
  if (cfg.communication) {
    for (const agent of sim.agents) {
      if (!agent.alive) continue;
      if (sim.grid[agent.y * cfg.width + agent.x] > 0.55) signals.push({ x: agent.x, y: agent.y, id: agent.id });
    }
  }

  const targets: { x: number; y: number }[] = sim.agents.map((agent) => ({ x: agent.x, y: agent.y }));
  for (const agent of sim.agents) {
    if (!agent.alive) continue;
    let target = pickTarget(sim, agent, rng);
    if (cfg.communication) {
      const drop = rng() < cfg.signalNoise;
      if (!drop && signals.length) {
        let best = Infinity;
        let chosen = target;
        for (const sig of signals) {
          if (sig.id === agent.id) continue;
          const dx = shortest(sig.x - agent.x, cfg.width);
          const dy = shortest(sig.y - agent.y, cfg.height);
          const d = dx * dx + dy * dy;
          if (d < best) {
            best = d;
            chosen = { x: sig.x, y: sig.y };
          }
        }
        if (best < Infinity) target = chosen;
      }
    }
    targets[agent.id] = target;
  }

  let sx = 0;
  let sy = 0;
  let moved = 0;
  const stepEdges: [number, number][] = [];
  for (const agent of sim.agents) {
    if (!agent.alive) {
      agent.vx = 0;
      agent.vy = 0;
      continue;
    }
    const target = targets[agent.id];
    const dx = shortest(target.x - agent.x, cfg.width);
    const dy = shortest(target.y - agent.y, cfg.height);
    const vx = dx === 0 ? 0 : dx > 0 ? 1 : -1;
    const vy = dy === 0 ? 0 : dy > 0 ? 1 : -1;
    agent.x = wrap(agent.x + vx, cfg.width);
    agent.y = wrap(agent.y + vy, cfg.height);
    agent.vx = vx;
    agent.vy = vy;
    const len = Math.hypot(vx, vy);
    if (len > 0) {
      sx += vx / len;
      sy += vy / len;
      moved++;
    }
    const bin = (vy + 1) * 3 + (vx + 1);
    sim.moveCounts[bin] = (sim.moveCounts[bin] ?? 0) + 1;
  }
  const order = moved ? Math.hypot(sx, sy) / moved : 0;
  sim.orderSum += order;

  const temptation = temptNow(sim);
  const gifts: { id: number; amount: number }[] = [];
  const sharedNow = new Map<number, boolean>();
  const neighCache = new Map<number, Agent[]>();

  for (const agent of sim.agents) {
    if (!agent.alive) {
      sharedNow.set(agent.id, false);
      continue;
    }
    const neigh = neighborsOf(sim, agent);
    neighCache.set(agent.id, neigh);
    const mult = agent.strategy === "defector" ? temptation : 1;
    const idx = agent.y * cfg.width + agent.x;
    const take = Math.min(sim.grid[idx], Math.max(0, cfg.harvest * mult));
    sim.grid[idx] -= take;
    if (sim.grid[idx] < -1e-9) sim.issues.push("negative resource");
    if (sim.grid[idx] < 0) sim.grid[idx] = 0;
    sim.totalHarvest += take;

    let share = false;
    if (agent.strategy === "cooperator") share = true;
    else if (agent.strategy === "conditional" && agent.memory.length > 0) {
      let m = 0;
      for (const v of agent.memory) m += v;
      share = m / agent.memory.length >= 0.5;
    }
    if (share && cfg.shareNoise > 0 && rng() < cfg.shareNoise) share = false;
    const opportunity = neigh.length > 0 && take > 0;
    let didShare = false;
    let kept = take;
    if (share && neigh.length > 0 && take > 0) {
      const gift = cfg.share * take;
      const each = gift / neigh.length;
      for (const n of neigh) gifts.push({ id: n.id, amount: each });
      kept = take - gift;
      didShare = true;
    }
    agent.energy += kept;
    sharedNow.set(agent.id, didShare);
    if (opportunity) {
      sim.coopOpps++;
      if (didShare) sim.coopEvents++;
      if (sim.stepIndex >= Math.floor(cfg.steps * 0.75)) {
        sim.lateOpps++;
        if (didShare) sim.lateEvents++;
      }
    }
    const had = neigh.length > 0 ? 1 : 0;
    const sh = didShare ? 1 : 0;
    sim.mi[had * 2 + sh] += 1;
  }

  for (const gift of gifts) {
    const recipient = sim.agents[gift.id];
    if (recipient) recipient.energy += gift.amount;
  }

  for (const agent of sim.agents) {
    if (!agent.alive) continue;
    agent.energy -= cfg.metabolism;
    if (agent.energy <= 0) {
      agent.alive = false;
      agent.energy = 0;
    }
    const neigh = neighCache.get(agent.id) ?? [];
    if (cfg.memory > 0 && neigh.length > 0) {
      let s = 0;
      for (const n of neigh) if (sharedNow.get(n.id)) s++;
      agent.memory.push(s / neigh.length);
      if (agent.memory.length > cfg.memory) agent.memory.shift();
    }
    agent.lastShared = sharedNow.get(agent.id) ?? false;
  }

  for (let i = 0; i < sim.agents.length; i++) {
    if (!sim.agents[i].alive) continue;
    for (let j = i + 1; j < sim.agents.length; j++) {
      if (!sim.agents[j].alive) continue;
      const dx = shortest(sim.agents[j].x - sim.agents[i].x, cfg.width);
      const dy = shortest(sim.agents[j].y - sim.agents[i].y, cfg.height);
      if (dx * dx + dy * dy <= cfg.interactionRadius * cfg.interactionRadius) {
        const key = `${i}-${j}`;
        sim.pairs.set(key, (sim.pairs.get(key) ?? 0) + 1);
        if (stepEdges.length < 48) stepEdges.push([i, j]);
      }
    }
  }

  const rate = regenNow(sim);
  for (let i = 0; i < sim.grid.length; i++) {
    sim.grid[i] += rate * (sim.potential[i] - sim.grid[i]);
    if (sim.grid[i] < 0) sim.grid[i] = 0;
    if (sim.grid[i] > 1.5) sim.grid[i] = 1.5;
  }

  let energy = 0;
  let alive = 0;
  for (const agent of sim.agents) {
    energy += agent.energy;
    if (agent.alive) alive++;
  }
  const meanEnergy = sim.agents.length ? energy / sim.agents.length : 0;
  sim.energyTrace.push(meanEnergy);
  let resource = 0;
  for (let i = 0; i < sim.grid.length; i++) resource += sim.grid[i];
  sim.series.push({
    t: sim.stepIndex,
    cooperation: sim.coopOpps ? sim.coopEvents / sim.coopOpps : 0,
    energy: round3(meanEnergy),
    order: round3(order),
    resource: round3(resource / sim.grid.length),
  });

  const frameEvery = Math.max(1, Math.floor(cfg.steps / 20));
  if (sim.stepIndex % frameEvery === 0 || sim.stepIndex === cfg.steps - 1) recordFrame(sim, stepEdges);
  sim.stepIndex += 1;
}

function pickTarget(sim: SimState, agent: Agent, rng: Rng): { x: number; y: number } {
  const { cfg } = sim;
  if (cfg.observability === "blind") {
    return {
      x: wrap(agent.x + Math.floor(rng() * 3) - 1, cfg.width),
      y: wrap(agent.y + Math.floor(rng() * 3) - 1, cfg.height),
    };
  }
  if (cfg.observability === "shuffled") {
    return { x: Math.floor(rng() * cfg.width), y: Math.floor(rng() * cfg.height) };
  }
  let best = -Infinity;
  let bx = agent.x;
  let by = agent.y;
  for (let dy = -cfg.vision; dy <= cfg.vision; dy++) {
    for (let dx = -cfg.vision; dx <= cfg.vision; dx++) {
      const x = wrap(agent.x + dx, cfg.width);
      const y = wrap(agent.y + dy, cfg.height);
      const val = sim.grid[y * cfg.width + x];
      if (val > best + 1e-12 || (Math.abs(val - best) <= 1e-12 && (y < by || (y === by && x < bx)))) {
        best = val;
        bx = x;
        by = y;
      }
    }
  }
  return { x: bx, y: by };
}

function graphFromPairs(n: number, pairs: Map<string, number>, minCount: number): [number, number][] {
  const edges: [number, number][] = [];
  for (const [key, count] of pairs) {
    if (count < minCount) continue;
    const [a, b] = key.split("-").map(Number);
    if (a < n && b < n) edges.push([a, b]);
  }
  return edges;
}

export function clusteringCoefficient(n: number, edges: [number, number][]): number {
  const adj: Set<number>[] = Array.from({ length: n }, () => new Set());
  for (const [a, b] of edges) {
    if (a === b || a >= n || b >= n) continue;
    adj[a].add(b);
    adj[b].add(a);
  }
  let sum = 0;
  let count = 0;
  for (let i = 0; i < n; i++) {
    const neigh = [...adj[i]];
    const k = neigh.length;
    if (k < 2) continue;
    let links = 0;
    for (let a = 0; a < k; a++) {
      for (let b = a + 1; b < k; b++) if (adj[neigh[a]].has(neigh[b])) links++;
    }
    sum += (2 * links) / (k * (k - 1));
    count++;
  }
  return count ? sum / count : 0;
}

function meanDegree(n: number, edges: [number, number][]): number {
  if (n === 0) return 0;
  return (2 * edges.length) / n;
}

function newmanAssortativity(n: number, edges: [number, number][], types: string[]): number {
  if (edges.length === 0) return 0;
  const labels = [...new Set(types)];
  const index = new Map(labels.map((l, i) => [l, i]));
  const k = labels.length;
  const e = Array.from({ length: k }, () => new Array(k).fill(0));
  for (const [a, b] of edges) {
    const i = index.get(types[a]) ?? 0;
    const j = index.get(types[b]) ?? 0;
    e[i][j] += 0.5;
    e[j][i] += 0.5;
  }
  const m = edges.length;
  let trace = 0;
  let sumA2 = 0;
  for (let i = 0; i < k; i++) {
    let ai = 0;
    for (let j = 0; j < k; j++) {
      e[i][j] /= m;
      ai += e[i][j];
    }
    trace += e[i][i];
    sumA2 += ai * ai;
  }
  const den = 1 - sumA2;
  if (Math.abs(den) < 1e-9) return 0;
  return (trace - sumA2) / den;
}

function rewire(n: number, edges: [number, number][], rng: Rng): [number, number][] {
  const e = edges.map(([a, b]) => [a, b] as [number, number]);
  if (e.length < 2) return e;
  const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const set = new Set(e.map(([a, b]) => key(a, b)));
  const sweeps = Math.max(20, e.length * 4);
  for (let s = 0; s < sweeps; s++) {
    const i = Math.floor(rng() * e.length);
    const j = Math.floor(rng() * e.length);
    if (i === j) continue;
    const [a, b] = e[i];
    const [c, d] = e[j];
    if (new Set([a, b, c, d]).size < 4) continue;
    const n1: [number, number] = a < c ? [a, c] : [c, a];
    const n2: [number, number] = b < d ? [b, d] : [d, b];
    const k1 = key(n1[0], n1[1]);
    const k2 = key(n2[0], n2[1]);
    if (set.has(k1) || set.has(k2)) continue;
    set.delete(key(a, b));
    set.delete(key(c, d));
    set.add(k1);
    set.add(k2);
    e[i] = n1;
    e[j] = n2;
  }
  return e;
}

export function metricsFromState(sim: SimState): Metrics {
  const n = sim.agents.length;
  const energies = sim.agents.map((a) => a.energy);
  const alive = sim.agents.filter((a) => a.alive).length;
  const edges = graphFromPairs(n, sim.pairs, 2);
  const types = sim.agents.map((a) => a.strategy);
  const cluster = clusteringCoefficient(n, edges);
  const rewired = rewire(n, edges, makeRng(sim.cfg.seed + 7919));
  const clusterR = clusteringCoefficient(n, rewired);
  const steps = Math.max(1, sim.stepIndex);
  let recovery = 1;
  const p = sim.cfg.perturbation;
  if (p && sim.energyTrace.length > p.end) {
    const preIdx = Math.max(0, p.start - 1);
    const pre = sim.energyTrace[preIdx] ?? 0;
    const end = sim.energyTrace[sim.energyTrace.length - 1] ?? 0;
    recovery = pre > 0.02 ? end / pre : Number.NaN;
  }
  return {
    cooperation: sim.coopOpps ? sim.coopEvents / sim.coopOpps : 0,
    lateCooperation: sim.lateOpps ? sim.lateEvents / sim.lateOpps : 0,
    meanEnergy: n ? meanNum(energies) : 0,
    gini: gini(energies),
    order: sim.orderSum / steps,
    efficiency: n ? sim.totalHarvest / n / steps : 0,
    perCapitaHarvest: n ? sim.totalHarvest / n : 0,
    survival: n ? alive / n : 0,
    assortativity: newmanAssortativity(n, edges, types),
    clustering: cluster,
    clusteringLift: cluster - clusterR,
    entropy: shannonEntropy(sim.moveCounts),
    mutualInfo: binaryMutualInfo(sim.mi[0], sim.mi[1], sim.mi[2], sim.mi[3]),
    meanDegree: meanDegree(n, edges),
    recovery,
  };
}

function meanNum(xs: number[]): number {
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

function execute(cfg: SimConfig, patches: Patch[], layout: InitAgent[], salt = 0): SimState {
  const sim = emptyState(cfg, patches, layout);
  const rng = makeRng((cfg.seed + 17 + salt * 101) >>> 0);
  for (let t = 0; t < cfg.steps; t++) stepSim(sim, rng);
  return sim;
}

function averageMetrics(list: Metrics[]): Metrics {
  const keys = Object.keys(list[0]) as (keyof Metrics)[];
  const out = { ...list[0] };
  for (const key of keys) {
    let s = 0;
    let c = 0;
    for (const m of list) {
      if (Number.isFinite(m[key])) {
        s += m[key];
        c++;
      }
    }
    out[key] = c ? s / c : Number.NaN;
  }
  return out;
}

export interface TrialRaw {
  metrics: Metrics;
  series: SeriesPoint[];
  frames: Frame[];
  issues: string[];
  width: number;
  height: number;
}

export function runSim(partial: Partial<SimConfig> & { seed: number }): TrialRaw {
  const cfg = normalizeConfig(partial);
  const patches = makePatches(cfg, makeRng(cfg.seed));
  const layout = makeLayout(cfg, makeRng(cfg.seed + 1));
  if (!cfg.solo) {
    const sim = execute(cfg, patches, layout);
    return {
      metrics: metricsFromState(sim),
      series: sim.series,
      frames: sim.frames,
      issues: unique(sim.issues),
      width: cfg.width,
      height: cfg.height,
    };
  }
  const individuals: SimState[] = [];
  for (const agent of layout) {
    const one: SimConfig = { ...cfg, solo: false, agents: 1 };
    individuals.push(execute(one, patches, [{ ...agent, id: 0 }], agent.id + 1));
  }
  const metrics = averageMetrics(individuals.map(metricsFromState));
  const first = individuals[0];
  return {
    metrics,
    series: first ? first.series : [],
    frames: first ? first.frames : [],
    issues: unique(individuals.flatMap((s) => s.issues)),
    width: cfg.width,
    height: cfg.height,
  };
}

function unique(xs: string[]): string[] {
  return [...new Set(xs)];
}

export function toTrialRecord(arm: string, seed: number, parameter: number | null, raw: TrialRaw): TrialRecord {
  const series = downsample(raw.series, 36);
  return { seed, arm, parameter, metrics: sanitizeMetrics(raw.metrics), series };
}

function sanitizeMetrics(m: Metrics): Metrics {
  const out = { ...m };
  (Object.keys(out) as (keyof Metrics)[]).forEach((k) => {
    if (!Number.isFinite(out[k])) out[k] = 0;
    out[k] = Math.round(out[k] * 10000) / 10000;
  });
  return out;
}

function downsample<T>(xs: T[], max: number): T[] {
  if (xs.length <= max) return xs;
  const out: T[] = [];
  for (let i = 0; i < max; i++) {
    const idx = Math.round((i * (xs.length - 1)) / (max - 1));
    out.push(xs[idx]);
  }
  return out;
}

export function qualityIssues(metrics: Metrics, rawIssues: string[]): string[] {
  const issues = [...rawIssues];
  (Object.keys(metrics) as (keyof Metrics)[]).forEach((k) => {
    if (!Number.isFinite(metrics[k])) issues.push(`${k} not finite`);
  });
  if (metrics.meanEnergy < 0) issues.push("negative mean energy");
  if (metrics.survival < 0 || metrics.survival > 1) issues.push("survival out of range");
  if (metrics.cooperation < -1e-6 || metrics.cooperation > 1 + 1e-6) issues.push("cooperation out of range");
  return unique(issues);
}

/** Resource accounting over one step: harvest leaves the grid, regen restores toward potential. */
export function stepAccount(partial: Partial<SimConfig> & { seed: number }): {
  before: number;
  after: number;
  harvested: number;
  regenerated: number;
} {
  const sim = createSim(partial);
  let before = 0;
  for (let i = 0; i < sim.grid.length; i++) before += sim.grid[i];
  const harvestBefore = sim.totalHarvest;
  const gridBefore = new Float64Array(sim.grid);
  stepSim(sim, makeRng(12345));
  let harvested = sim.totalHarvest - harvestBefore;
  // Regen happens after harvest inside stepSim. Reconstruct regen as after - (before - harvested).
  let after = 0;
  for (let i = 0; i < sim.grid.length; i++) after += sim.grid[i];
  const regenerated = after - (before - harvested);
  void gridBefore;
  return { before, after, harvested, regenerated };
}
