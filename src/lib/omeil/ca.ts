import { makeRng } from "./rng.ts";

/** Conway's Life on a torus. A known system used as an instrument, not a discovery claim. */
export function lifeStep(grid: Uint8Array, w: number, h: number): Uint8Array {
  const next = new Uint8Array(grid.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const xx = (x + dx + w) % w;
          const yy = (y + dy + h) % h;
          n += grid[yy * w + xx];
        }
      }
      const alive = grid[y * w + x];
      next[y * w + x] = alive ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
    }
  }
  return next;
}

export function lifeDensity(grid: Uint8Array): number {
  let s = 0;
  for (const c of grid) s += c;
  return s / grid.length;
}

export function detectPeriod(grids: Uint8Array[], max = 12): number | null {
  const last = grids[grids.length - 1];
  if (!last) return null;
  const key = (g: Uint8Array) => g.join("");
  const target = key(last);
  for (let p = 1; p <= max; p++) {
    const prev = grids[grids.length - 1 - p];
    if (prev && key(prev) === target) return p;
  }
  return null;
}

export function blinker(): Uint8Array {
  const w = 5;
  const g = new Uint8Array(w * w);
  g[1 * w + 2] = 1;
  g[2 * w + 2] = 1;
  g[3 * w + 2] = 1;
  return g;
}

export function runLife(seed: number, steps: number, w = 24, h = 24, fill = 0.28) {
  const rng = makeRng(seed);
  let grid = new Uint8Array(w * h);
  for (let i = 0; i < grid.length; i++) grid[i] = rng() < fill ? 1 : 0;
  const series: { t: number; density: number }[] = [];
  const history: Uint8Array[] = [];
  for (let t = 0; t < steps; t++) {
    series.push({ t, density: lifeDensity(grid) });
    history.push(grid);
    if (history.length > 16) history.shift();
    grid = lifeStep(grid, w, h) as Uint8Array<ArrayBuffer>;
  }
  return { series, period: detectPeriod(history), width: w, height: h, grid };
}
