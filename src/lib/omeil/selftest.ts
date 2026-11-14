import { blinker, detectPeriod, lifeStep } from "./ca.ts";
import { changePoint, plantedStepSeries } from "./anomaly.ts";
import { specById, runSpec } from "./experiments.ts";
import { judge } from "./review.ts";
import { gini, studentTPValue, welchTTest } from "./stats.ts";
import { runSim } from "./simulate.ts";
import type { ExperimentRecord, SelfTest } from "./types.ts";

export async function runSelfTests(): Promise<SelfTest[]> {
  const at = new Date().toISOString();
  const tests: SelfTest[] = [];
  const add = (id: string, name: string, passed: boolean, detail: string) => {
    tests.push({ id, name, passed, detail, at });
  };

  const p10 = studentTPValue(2.228, 10);
  add(
    "t-critical",
    "Student t tail at df = 10",
    Math.abs(p10 - 0.05) < 0.004,
    `Two-sided p at t = 2.228 is ${p10.toFixed(4)} (table value ≈ 0.050).`,
  );

  const same = welchTTest([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
  add("welch-identical", "Welch test, identical samples", same.p > 0.99, `p = ${same.p.toFixed(3)}, t = ${same.t.toFixed(3)}.`);

  const far = welchTTest([1, 2, 3, 4, 5], [10, 11, 12, 13, 14]);
  add("welch-separated", "Welch test, separated samples", far.p < 1e-4 && far.diff > 0, `p = ${far.p.toExponential(2)}.`);

  add("gini-zero", "Gini of equal values", gini([2, 2, 2, 2]) < 1e-9, `gini = ${gini([2, 2, 2, 2]).toExponential(2)}.`);
  add("gini-unequal", "Gini of a spike", gini([0, 0, 0, 1]) > 0.5, `gini = ${gini([0, 0, 0, 1]).toFixed(3)}.`);

  const a = runSim({ seed: 11, steps: 20, agents: 8 });
  const b = runSim({ seed: 11, steps: 20, agents: 8 });
  add(
    "determinism",
    "Same seed, same metrics",
    JSON.stringify(a.metrics) === JSON.stringify(b.metrics),
    `Energy ${a.metrics.meanEnergy} vs ${b.metrics.meanEnergy}.`,
  );

  const defs = runSim({
    seed: 5,
    steps: 18,
    agents: 8,
    width: 18,
    height: 18,
    mix: { cooperator: 0, defector: 1, conditional: 0, forager: 0 },
    interactionRadius: 6,
  });
  add(
    "defector-rule",
    "Defectors never share",
    defs.metrics.cooperation === 0,
    `Cooperation rate ${defs.metrics.cooperation}.`,
  );

  const coops = runSim({
    seed: 6,
    steps: 18,
    agents: 10,
    width: 14,
    height: 14,
    mix: { cooperator: 1, defector: 0, conditional: 0, forager: 0 },
    interactionRadius: 8,
  });
  add(
    "cooperator-rule",
    "Cooperators share when they meet",
    coops.metrics.cooperation > 0.8,
    `Cooperation rate ${coops.metrics.cooperation}.`,
  );

  let bounded = true;
  for (const frame of a.frames) {
    if (frame.resources.length < 8) bounded = false;
  }
  add(
    "frames",
    "Replay frames were recorded",
    a.frames.length >= 2 && bounded && a.metrics.survival >= 0 && a.metrics.survival <= 1,
    `${a.frames.length} frames, survival ${a.metrics.survival}.`,
  );

  const finite = Object.values(a.metrics).every((v) => Number.isFinite(v));
  add("finite-metrics", "Metrics are finite", finite, finite ? "All finite." : "A metric was NaN or infinite.");

  let grid = blinker();
  const history = [grid];
  for (let i = 0; i < 4; i++) {
    grid = lifeStep(grid, 5, 5);
    history.push(grid);
  }
  const period = detectPeriod(history, 4);
  add("life-blinker", "Life blinker has period 2", period === 2, `Detected period ${period}.`);

  const planted = plantedStepSeries(48, 20, 0.08, 9);
  const cp = changePoint(planted);
  add(
    "planted-shift",
    "Mean-shift finds a planted step",
    Math.abs(cp.index - 20) <= 3 && cp.z >= 5,
    `Index ${cp.index}, z ${cp.z.toFixed(2)}.`,
  );

  const capped = judge(fakeRecord(3));
  add(
    "level-cap",
    "Maturity level cannot exceed 2",
    capped.discoveryLevel <= 2,
    `Judge returned level ${capped.discoveryLevel}.`,
  );

  const spec = specById("exp-null");
  if (!spec) {
    add("null-run", "Null spec exists", false, "exp-null missing.");
  } else {
    const rec = await runSpec(spec, { trials: 4, steps: 16, seedBase: 42, userAgent: "self-test" });
    add(
      "null-run",
      "Null arms execute",
      rec.failure == null && rec.trials.length === 16 && rec.discoveryLevel === 0,
      `Status ${rec.status}, class ${rec.classification}, trials ${rec.trials.length}, raw p ${rec.analysis.pRaw.toFixed(3)}.`,
    );
  }

  return tests;
}

function fakeRecord(level: number): ExperimentRecord {
  void level;
  return {
    id: "fake",
    specId: "exp-temptation",
    title: "fake",
    domain: "test",
    question: "q",
    hypothesis: "h",
    alternative: "a",
    falsify: "f",
    direction: "treatment-lower",
    status: "completed",
    primaryMetric: "meanEnergy",
    citations: [],
    knownAs: "related-literature",
    trials: [],
    analysis: {
      kind: "two-sample",
      metric: "meanEnergy",
      nControl: 12,
      nTreatment: 12,
      meanControl: 2,
      meanTreatment: 1,
      sdControl: 0.2,
      sdTreatment: 0.2,
      effect: -1,
      hedgesG: -1.2,
      t: -4,
      df: 20,
      pRaw: 0.001,
      pAdjusted: 0.001,
      familySize: 1,
      ciLow: -1.4,
      ciHigh: -0.6,
      powerAtObserved: 0.9,
      powerAtSei: 0.8,
      smallestEffectOfInterest: 0.5,
      replicationSameSign: true,
      replicationEffect: -0.8,
      spearman: null,
      changeIndex: null,
      changeZ: null,
      confirmatory: true,
      assumptions: [],
      notes: [],
    },
    classification: "previously-reported",
    discoveryLevel: 0,
    levelRationale: "",
    reviews: [],
    provenance: {
      app: "OMEIL",
      version: "test",
      engine: "test",
      rng: "mulberry32",
      configHash: "x",
      createdAt: "2026-01-01T00:00:00.000Z",
      trialsPerArm: 12,
      steps: 10,
      cores: null,
      userAgent: "test",
      synthetic: true,
    },
    replay: null,
    dataQuality: [],
    limitations: [],
    confounds: [],
    failure: null,
  };
}
