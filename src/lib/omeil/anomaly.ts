import { meanShift } from "./stats.ts";
import type { Metrics, SeriesPoint } from "./types.ts";

export function fingerprint(m: Metrics): number[] {
  return [
    m.cooperation,
    m.meanEnergy / 5,
    m.gini,
    m.order,
    m.efficiency,
    m.survival,
    m.assortativity,
    m.clustering,
    m.entropy / 4,
    m.mutualInfo,
    m.meanDegree / 8,
    m.lateCooperation,
  ];
}

export function euclidean(a: number[], b: number[]): number {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

export function nearestDistance(fp: number[], library: number[][]): number {
  if (library.length === 0) return Number.NaN;
  let best = Infinity;
  for (const other of library) best = Math.min(best, euclidean(fp, other));
  return best;
}

export interface ChangeFinding {
  index: number;
  z: number;
  delta: number;
  /** Instrument label only. A large z is not automatically a scientific discovery. */
  label: "no-shift" | "weak-shift" | "candidate-change-point";
}

export function changePoint(series: number[]): ChangeFinding {
  const found = meanShift(series);
  const label = found.z >= 5 ? "candidate-change-point" : found.z >= 2.5 ? "weak-shift" : "no-shift";
  return { index: found.index, z: found.z, delta: found.delta, label };
}

export function seriesMetric(series: SeriesPoint[], key: "cooperation" | "energy" | "order" | "resource"): number[] {
  return series.map((p) => p[key]);
}

export function plantedStepSeries(n = 48, at = 20, noise = 0.05, seed = 7): number[] {
  let s = seed >>> 0;
  const rnd = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const base = i < at ? 0.2 : 0.75;
    out.push(base + (rnd() - 0.5) * noise);
  }
  return out;
}

export function noiseSeries(n = 48, seed = 1): number[] {
  let s = seed >>> 0;
  const rnd = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(0.5 + (rnd() - 0.5) * 0.08);
  return out;
}
