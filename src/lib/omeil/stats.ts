import { makeRng, type Rng } from "./rng.ts";

export function mean(xs: number[]): number {
  if (xs.length === 0) return Number.NaN;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

export function sampleVariance(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  let s = 0;
  for (const x of xs) {
    const d = x - m;
    s += d * d;
  }
  return s / (xs.length - 1);
}

export function sampleSd(xs: number[]): number {
  return Math.sqrt(sampleVariance(xs));
}

/** Lanczos ln Γ. */
export function logGamma(z: number): number {
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < c.length; i++) x += c[i] / (z + i);
  const t = z + c.length - 1.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betacf(a: number, b: number, x: number): number {
  const MAX = 200;
  const EPS = 3e-12;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAX; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Regularised incomplete beta I_x(a, b). */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/** Two-sided Student t p-value. */
export function studentTPValue(tAbs: number, df: number): number {
  if (!Number.isFinite(tAbs) || !(df > 0)) return 1;
  if (tAbs === 0) return 1;
  const x = df / (df + tAbs * tAbs);
  const p = regularizedIncompleteBeta(x, df / 2, 0.5);
  return Math.min(1, Math.max(0, p));
}

export function welchTTest(a: number[], b: number[]): {
  meanA: number;
  meanB: number;
  sdA: number;
  sdB: number;
  t: number;
  df: number;
  p: number;
  diff: number;
} {
  const nA = a.length;
  const nB = b.length;
  const meanA = mean(a);
  const meanB = mean(b);
  const sdA = sampleSd(a);
  const sdB = sampleSd(b);
  const diff = meanB - meanA;
  if (nA < 2 || nB < 2) {
    return { meanA, meanB, sdA, sdB, t: 0, df: 0, p: 1, diff };
  }
  const va = sampleVariance(a) / nA;
  const vb = sampleVariance(b) / nB;
  const se2 = va + vb;
  if (se2 <= 1e-18) {
    return { meanA, meanB, sdA, sdB, t: 0, df: nA + nB - 2, p: diff === 0 ? 1 : 0, diff };
  }
  const t = diff / Math.sqrt(se2);
  const df = (se2 * se2) / ((va * va) / (nA - 1) + (vb * vb) / (nB - 1));
  const p = studentTPValue(Math.abs(t), df);
  return { meanA, meanB, sdA, sdB, t, df, p, diff };
}

export function oneSampleT(xs: number[], mu = 0): {
  mean: number;
  sd: number;
  t: number;
  df: number;
  p: number;
} {
  const n = xs.length;
  const m = mean(xs);
  const sd = sampleSd(xs);
  if (n < 2) return { mean: m, sd, t: 0, df: 0, p: 1 };
  const se = sd / Math.sqrt(n);
  if (se <= 1e-18) return { mean: m, sd, t: 0, df: n - 1, p: Math.abs(m - mu) < 1e-12 ? 1 : 0 };
  const t = (m - mu) / se;
  return { mean: m, sd, t, df: n - 1, p: studentTPValue(Math.abs(t), n - 1) };
}

export function hedgesG(a: number[], b: number[]): number {
  const n1 = a.length;
  const n2 = b.length;
  if (n1 < 2 || n2 < 2) return 0;
  const s1 = sampleVariance(a);
  const s2 = sampleVariance(b);
  const sp = Math.sqrt(((n1 - 1) * s1 + (n2 - 1) * s2) / (n1 + n2 - 2));
  if (sp <= 1e-18) return 0;
  const d = (mean(b) - mean(a)) / sp;
  const j = 1 - 3 / (4 * (n1 + n2) - 9);
  return j * d;
}

export function gini(values: number[]): number {
  const xs = values.filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
  const n = xs.length;
  if (n === 0) return 0;
  let sum = 0;
  for (const x of xs) sum += x;
  if (sum <= 1e-12) return 0;
  let acc = 0;
  for (let i = 0; i < n; i++) acc += (i + 1) * xs[i];
  return (2 * acc) / (n * sum) - (n + 1) / n;
}

function ranks(xs: number[]): number[] {
  const idx = xs.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v || a.i - b.i);
  const r = new Array<number>(xs.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1].v === idx[i].v) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k].i] = avg;
    i = j + 1;
  }
  return r;
}

export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return Number.NaN;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx <= 0 || dy <= 0) return 0;
  return num / Math.sqrt(dx * dy);
}

export function spearman(xs: number[], ys: number[]): number {
  return pearson(ranks(xs), ranks(ys));
}

export function linearSlope(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    num += a * (ys[i] - my);
    den += a * a;
  }
  return den === 0 ? 0 : num / den;
}

/** Mean-shift scan. Returns the split with the largest |z| between segment means. */
export function meanShift(series: number[]): { index: number; delta: number; z: number } {
  const n = series.length;
  let best = { index: -1, delta: 0, z: 0 };
  if (n < 8) return best;
  for (let k = 4; k <= n - 4; k++) {
    const left = series.slice(0, k);
    const right = series.slice(k);
    const delta = mean(right) - mean(left);
    const se2 = sampleVariance(left) / left.length + sampleVariance(right) / right.length;
    const z = se2 <= 1e-18 ? (Math.abs(delta) > 1e-8 ? 99 : 0) : Math.abs(delta) / Math.sqrt(se2);
    if (z > best.z) best = { index: k, delta, z };
  }
  return best;
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Approximate two-sided power for a two-sample t test under normal, equal-n,
 * equal-variance assumptions. This is an approximation, not a guarantee.
 */
export function approxTwoSamplePower(cohensD: number, nPerArm: number, alpha = 0.05): number {
  if (nPerArm < 2) return Number.NaN;
  const zAlpha = alpha === 0.05 ? 1.95996398454 : normalQuantile(1 - alpha / 2);
  const ncp = Math.abs(cohensD) * Math.sqrt(nPerArm / 2);
  const power = 1 - normalCdf(zAlpha - ncp) + normalCdf(-zAlpha - ncp);
  return Math.min(1, Math.max(0, power));
}

function normalQuantile(p: number): number {
  // Acklam approximation, sufficient for alpha tails we use.
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q: number;
  let r: number;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > phigh) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  q = p - 0.5;
  r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

export function bootstrapMeanDiff(a: number[], b: number[], seed: number, reps = 400): [number, number] {
  if (a.length === 0 || b.length === 0) return [Number.NaN, Number.NaN];
  const rng: Rng = makeRng(seed);
  const diffs = new Array<number>(reps);
  for (let i = 0; i < reps; i++) {
    let sa = 0;
    let sb = 0;
    for (let k = 0; k < a.length; k++) sa += a[Math.floor(rng() * a.length)];
    for (let k = 0; k < b.length; k++) sb += b[Math.floor(rng() * b.length)];
    diffs[i] = sb / b.length - sa / a.length;
  }
  diffs.sort((x, y) => x - y);
  const lo = diffs[Math.max(0, Math.floor(0.025 * (reps - 1)))];
  const hi = diffs[Math.min(reps - 1, Math.ceil(0.975 * (reps - 1)))];
  return [lo, hi];
}

export function shannonEntropy(counts: number[]): number {
  let n = 0;
  for (const c of counts) n += c;
  if (n <= 0) return 0;
  let h = 0;
  for (const c of counts) {
    if (c <= 0) continue;
    const p = c / n;
    h -= p * Math.log2(p);
  }
  return h;
}

export function binaryMutualInfo(n00: number, n01: number, n10: number, n11: number): number {
  const n = n00 + n01 + n10 + n11;
  if (n <= 0) return 0;
  const joints = [n00, n01, n10, n11];
  const row = [n00 + n01, n10 + n11];
  const col = [n00 + n10, n01 + n11];
  let mi = 0;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const cij = joints[i * 2 + j];
      if (cij <= 0) continue;
      const pxy = cij / n;
      const px = row[i] / n;
      const py = col[j] / n;
      if (px <= 0 || py <= 0) continue;
      mi += pxy * Math.log2(pxy / (px * py));
    }
  }
  return mi;
}

export function assertFinite(name: string, value: number, issues: string[]) {
  if (!Number.isFinite(value)) issues.push(`${name} is not finite`);
}
