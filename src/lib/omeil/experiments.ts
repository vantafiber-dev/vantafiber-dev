import { changePoint, noiseSeries, plantedStepSeries } from "./anomaly.ts";
import { hashString } from "./rng.ts";
import { judge } from "./review.ts";
import {
  approxTwoSamplePower,
  bootstrapMeanDiff,
  hedgesG,
  linearSlope,
  mean,
  oneSampleT,
  sampleSd,
  spearman,
  welchTTest,
} from "./stats.ts";
import { qualityIssues, runSim, toTrialRecord } from "./simulate.ts";
import { APP_VERSION, ENGINE_ID } from "./types.ts";
import type {
  AnalysisResult,
  CoverageCell,
  ExperimentRecord,
  Metrics,
  Provenance,
  Replay,
  SimConfig,
  TrialRecord,
} from "./types.ts";

export interface ArmPlan {
  arm: string;
  parameter: number | null;
  patch: Partial<SimConfig>;
}

export interface ExperimentSpec {
  id: string;
  title: string;
  domain: string;
  question: string;
  hypothesis: string;
  alternative: string;
  falsify: string;
  citations: string[];
  knownAs: ExperimentRecord["knownAs"];
  confirmatory: boolean;
  primary: keyof Metrics;
  direction: ExperimentRecord["direction"];
  confounds: string[];
  limitations: string[];
  coverage: CoverageCell[];
  instrument?: "planted" | "false-positive";
  arms: (steps: number) => ArmPlan[];
}

const MIXED: SimConfig["mix"] = { cooperator: 1, defector: 1, conditional: 1, forager: 1 };
const FORAGER: SimConfig["mix"] = { cooperator: 0, defector: 0, conditional: 0, forager: 1 };
const SOCIAL: SimConfig["mix"] = { cooperator: 1, defector: 1, conditional: 0, forager: 0 };
const MEMORY_MIX: SimConfig["mix"] = { cooperator: 3, defector: 2, conditional: 5, forager: 0 };
const SIGNALERS: SimConfig["mix"] = { cooperator: 0, defector: 0, conditional: 0, forager: 1 };

const COMMON_LIMITS = [
  "Agents use fixed rules, not learned policies. A result does not transfer to language-model agents.",
  "The world is a small torus with three regenerating patches. Geography is part of the treatment.",
  "Dead agents stay in the mean at energy zero, so mortality and performance are entangled.",
  "Full texts of the neighbouring papers were not inspected.",
];

const COMMON_CONFOUNDS = [
  "Patch locations are random but matched by seed. A single unlucky map can still dominate a small sample.",
  "Interaction graphs are proximity graphs. Clustering above a rewired null is partly spatial embedding, not a social choice.",
  "Sharing is labelled cooperation only when the rule fires. The label is operational, not psychological.",
];

function two(control: Partial<SimConfig>, treatment: Partial<SimConfig>): (steps: number) => ArmPlan[] {
  return (steps) => [
    { arm: "control", parameter: null, patch: { ...control, steps } },
    { arm: "treatment", parameter: null, patch: { ...treatment, steps } },
  ];
}

export const SPECS: ExperimentSpec[] = [
  {
    id: "exp-diversity",
    title: "Strategy diversity and per-capita energy",
    domain: "Agent diversity",
    question: "Does an equal mix of four rules finish with different mean energy from an otherwise matched population of foragers?",
    hypothesis: "No directional prediction. Diversity may raise or lower mean energy through sharing and through extra extraction by defectors.",
    alternative: "Any energy gap is only the harvest multiplier, not the mixture itself.",
    falsify: "A preregistered directional claim is not made. The pattern is falsified as a stable effect if the replication block changes sign or the adjusted test is compatible with noise.",
    citations: ["hong2004", "nowak2006"],
    knownAs: "exploratory",
    confirmatory: false,
    primary: "meanEnergy",
    direction: "exploratory",
    confounds: [...COMMON_CONFOUNDS, "Cooperation rate is composition, not performance. It is not the primary outcome."],
    limitations: [...COMMON_LIMITS, "This is not a test of the Hong and Page theorem, which concerns problem-solving heuristics."],
    coverage: [
      { regen: "mid", temptation: "low", composition: "mixed" },
      { regen: "mid", temptation: "low", composition: "homogeneous" },
    ],
    arms: two({ mix: FORAGER, temptation: 1 }, { mix: MIXED, temptation: 1 }),
  },
  {
    id: "exp-population",
    title: "Population size and movement order",
    domain: "Behavioural transitions",
    question: "Does the movement-order parameter change smoothly or abruptly as population increases on a fixed map?",
    hypothesis: "Exploratory. Crowding may increase alignment of resource-seeking, or it may scramble it.",
    alternative: "Order is insensitive to population inside this range.",
    falsify: "A claim of an abrupt threshold is rejected if the mean-shift z on the averaged curve stays below 5.",
    citations: ["vicsek1995", "couzin2005"],
    knownAs: "exploratory",
    confirmatory: false,
    primary: "order",
    direction: "exploratory",
    confounds: ["Order is alignment of resource-seeking steps, not Vicsek alignment. Density also changes depletion."],
    limitations: [...COMMON_LIMITS, "Six population sizes cannot resolve a critical exponent."],
    coverage: [{ regen: "mid", temptation: "low", composition: "mixed" }],
    arms: (steps) => [4, 8, 12, 16, 24, 32].map((n) => ({ arm: `n=${n}`, parameter: n, patch: { agents: n, mix: MIXED, steps } })),
  },
  {
    id: "exp-stigmergy",
    title: "Environmental information without messages",
    domain: "Coordination",
    question: "Do agents that can see local resources harvest more efficiently than matched agents whose targets are shuffled?",
    hypothesis: "Shuffling targets removes usable local information, so efficiency should fall. This is a positive control of the movement rule.",
    alternative: "Harvest is dominated by regeneration, so blinding targets does little.",
    falsify: "Rejected if shuffled-target efficiency is not lower, or if the sign fails to replicate.",
    citations: ["schelling1971"],
    knownAs: "expected-mechanism",
    confirmatory: true,
    primary: "efficiency",
    direction: "treatment-lower",
    confounds: [...COMMON_CONFOUNDS, "Shuffling changes path length as well as information. The contrast is not a pure information ablation."],
    limitations: [...COMMON_LIMITS, "Success confirms the programmed rule. It does not show that coordination 'emerged'."],
    coverage: [{ regen: "mid", temptation: "low", composition: "homogeneous" }],
    arms: two(
      { observability: "local", mix: FORAGER, communication: false, vision: 3 },
      { observability: "shuffled", mix: FORAGER, communication: false, vision: 3 },
    ),
  },
  {
    id: "exp-temptation",
    title: "Extraction pressure and collective energy",
    domain: "Competition and commons",
    question: "Does raising the defector harvest multiplier reduce end-of-run mean energy in a cooperator–defector population?",
    hypothesis: "Higher temptation depletes patches faster and should lower collective mean energy.",
    alternative: "Extra extraction is fully offset by regeneration, so mean energy does not fall.",
    falsify: "Rejected if treatment mean energy is not lower, or the replication sign flips.",
    citations: ["hardin1968", "nowak1992"],
    knownAs: "related-literature",
    confirmatory: true,
    primary: "meanEnergy",
    direction: "treatment-lower",
    confounds: [
      ...COMMON_CONFOUNDS,
      "Defectors also change who survives. A lower mean may be mortality rather than a standing inefficiency among the living.",
    ],
    limitations: [
      ...COMMON_LIMITS,
      "Consistent with a commons mechanism. Not a replication of Hardin 1968 or Nowak and May 1992, which use different rules.",
    ],
    coverage: [
      { regen: "mid", temptation: "low", composition: "mixed" },
      { regen: "mid", temptation: "high", composition: "mixed" },
    ],
    arms: two(
      { mix: SOCIAL, temptation: 1 },
      { mix: SOCIAL, temptation: 1.85 },
    ),
  },
  {
    id: "exp-scarcity",
    title: "Regeneration and conditional sharing",
    domain: "Resource scarcity",
    question: "Does slower regeneration change late-run sharing in a population that can reciprocate?",
    hypothesis: "Exploratory. Scarcity may reduce encounters that teach conditional agents to share, or it may concentrate agents on the remaining patches and increase encounters.",
    alternative: "Sharing is fixed by the rule mix and does not track regeneration.",
    falsify: "A later confirmatory claim would require a pre-set direction. This run only describes the sign.",
    citations: ["axelrod1981", "hardin1968"],
    knownAs: "exploratory",
    confirmatory: false,
    primary: "lateCooperation",
    direction: "exploratory",
    confounds: ["Low regeneration kills agents, which removes opportunities. The rate is conditional on opportunities that still occur."],
    limitations: COMMON_LIMITS,
    coverage: [
      { regen: "high", temptation: "low", composition: "mixed" },
      { regen: "low", temptation: "low", composition: "mixed" },
    ],
    arms: two(
      { mix: MEMORY_MIX, regen: 0.28, memory: 8, shareNoise: 0.1 },
      { mix: MEMORY_MIX, regen: 0.05, memory: 8, shareNoise: 0.1 },
    ),
  },
  {
    id: "exp-perturbation",
    title: "Recovery after a regeneration shock",
    domain: "Behavioural instability",
    question: "After a temporary collapse in regeneration, does final energy recover to the level of an unshocked matched world?",
    hypothesis: "A shock that lasts a third of the run should leave final energy lower if depletion or deaths do not unwind.",
    alternative: "Mean reversion of the resource field erases the shock before the final step.",
    falsify: "Rejected if shocked final energy is not lower, or the sign fails to replicate.",
    citations: ["bak1987"],
    knownAs: "exploratory",
    confirmatory: true,
    primary: "meanEnergy",
    direction: "treatment-lower",
    confounds: ["Recovery ratio is also stored, but the preregistered endpoint is final mean energy, not the time-to-recovery."],
    limitations: [...COMMON_LIMITS, "A slow return is not self-organised criticality and is not a phase transition."],
    coverage: [
      { regen: "mid", temptation: "low", composition: "mixed" },
      { regen: "low", temptation: "low", composition: "mixed" },
    ],
    arms: (steps) => {
      const start = Math.floor(steps * 0.4);
      const end = Math.floor(steps * 0.7);
      return [
        { arm: "control", parameter: null, patch: { mix: MIXED, steps, perturbation: null } },
        {
          arm: "treatment",
          parameter: null,
          patch: { mix: MIXED, steps, perturbation: { start, end, regen: 0.01 } },
        },
      ];
    },
  },
  {
    id: "exp-memory",
    title: "Memory length under noisy sharing",
    domain: "Memory",
    question: "When cooperators sometimes fail to share, does a longer memory increase late sharing by conditional agents?",
    hypothesis: "A longer window should smooth noise and raise late cooperation relative to a one-step memory.",
    alternative: "The 0.5 threshold treats both windows similarly, so memory length does not matter at this noise rate.",
    falsify: "Rejected if long memory does not show higher late cooperation, or the sign fails to replicate.",
    citations: ["axelrod1981"],
    knownAs: "expected-mechanism",
    confirmatory: true,
    primary: "lateCooperation",
    direction: "treatment-higher",
    confounds: ["Memory also changes who receives gifts, so energy and survival can move with the metric."],
    limitations: [...COMMON_LIMITS, "Memory here is a numeric window. It is not episodic memory and not identity."],
    coverage: [{ regen: "mid", temptation: "low", composition: "mixed" }],
    arms: two(
      { mix: MEMORY_MIX, memory: 1, shareNoise: 0.25 },
      { mix: MEMORY_MIX, memory: 12, shareNoise: 0.25 },
    ),
  },
  {
    id: "exp-collective",
    title: "Group foraging versus matched solo runs",
    domain: "Collective performance",
    question: "Is per-capita harvest higher when agents share one map than when each agent works the same map alone?",
    hypothesis: "No directional prediction. Interference can beat coverage, or the reverse.",
    alternative: "Per-capita harvest is the same once patch layout is matched.",
    falsify: "There is no directional hypothesis to falsify. A stable gap still needs a mechanism experiment before it is explained.",
    citations: ["hong2004", "couzin2005"],
    knownAs: "exploratory",
    confirmatory: false,
    primary: "perCapitaHarvest",
    direction: "exploratory",
    confounds: [
      "Solo runs replay one agent at a time on the same patches. They do not pay interference. They also do not leave trails for each other.",
      "The metric is harvest, not intelligence.",
    ],
    limitations: [...COMMON_LIMITS, "Do not describe a higher group mean as collective intelligence."],
    coverage: [{ regen: "mid", temptation: "low", composition: "homogeneous" }],
    arms: two({ mix: FORAGER, solo: false }, { mix: FORAGER, solo: true }),
  },
  {
    id: "exp-network",
    title: "Proximity-graph clustering against degree-preserving rewiring",
    domain: "Network structure",
    question: "Does the repeated-proximity graph cluster more than a degree-preserving rewiring of itself?",
    hypothesis: "Spatial embedding should produce positive clustering lift. This is an expected geometric consequence.",
    alternative: "The threshold of two co-locations yields a graph indistinguishable from its rewiring.",
    falsify: "Rejected if mean clustering lift is not positive, or the sign fails to replicate.",
    citations: ["watts1998", "barabasi1999"],
    knownAs: "expected-mechanism",
    confirmatory: true,
    primary: "clusteringLift",
    direction: "greater-than-zero",
    confounds: ["Positive lift does not imply preferential attachment, community identity, or a small-world path length."],
    limitations: [...COMMON_LIMITS, "Rewiring is a finite number of double-edge swaps, not an exact configuration-model sample."],
    coverage: [{ regen: "mid", temptation: "low", composition: "mixed" }],
    arms: (steps) => [{ arm: "spatial", parameter: null, patch: { mix: MIXED, steps } }],
  },
  {
    id: "exp-sweep",
    title: "Temptation sweep",
    domain: "Behavioural transitions",
    question: "How does mean energy move as the defector multiplier increases from 1.0 to 2.2?",
    hypothesis: "Exploratory. Energy may decline smoothly. A sharp mean-shift is not assumed.",
    alternative: "The curve is flat inside this range.",
    falsify: "Do not call a smooth decline a phase transition. A threshold claim requires mean-shift z ≥ 5 and a later confirmatory design.",
    citations: ["nowak1992", "vicsek1995", "hardin1968"],
    knownAs: "exploratory",
    confirmatory: false,
    primary: "meanEnergy",
    direction: "exploratory",
    confounds: ["Temptation changes both extraction and who dies. The curve confounds those paths."],
    limitations: [...COMMON_LIMITS, "Operational change-points are not physical phase transitions."],
    coverage: [
      { regen: "mid", temptation: "low", composition: "mixed" },
      { regen: "mid", temptation: "mid", composition: "mixed" },
      { regen: "mid", temptation: "high", composition: "mixed" },
    ],
    arms: (steps) =>
      [1, 1.3, 1.6, 1.9, 2.2].map((b) => ({
        arm: `b=${b.toFixed(1)}`,
        parameter: b,
        patch: { mix: SOCIAL, temptation: b, steps },
      })),
  },
  {
    id: "exp-path",
    title: "Order of scarcity and abundance",
    domain: "Path dependence",
    question: "Do scarce-then-rich and rich-then-scarce histories finish with different late sharing when the two halves use the same rates?",
    hypothesis: "Exploratory. Conditional agents may lock in different sharing if early encounters differ. A gap is path dependence only if it exceeds seed noise.",
    alternative: "Only the second half of the run matters, so the histories converge.",
    falsify: "A difference between two individual seeds is not path dependence. The arm contrast has to replicate in sign.",
    citations: ["arthur1989", "axelrod1981"],
    knownAs: "exploratory",
    confirmatory: false,
    primary: "lateCooperation",
    direction: "exploratory",
    confounds: ["The schedules change regeneration, deaths, and encounters together. History is not isolated from final resource level."],
    limitations: [...COMMON_LIMITS, "Not a replication of Arthur's technology-adoption model."],
    coverage: [
      { regen: "low", temptation: "low", composition: "mixed" },
      { regen: "high", temptation: "low", composition: "mixed" },
    ],
    arms: two(
      { mix: MEMORY_MIX, schedule: "scarce-then-rich", memory: 8 },
      { mix: MEMORY_MIX, schedule: "rich-then-scarce", memory: 8 },
    ),
  },
  {
    id: "exp-removal",
    title: "Abrupt removal of agents",
    domain: "Failure propagation",
    question: "Does removing 30% of agents mid-run lower final movement order relative to a matched population that is left intact?",
    hypothesis: "Removing agents should at least transiently reduce local alignment; the preregistered endpoint is final order, which may already have recovered.",
    alternative: "Final order is set by the map, so a mid-run removal leaves no trace.",
    falsify: "Rejected if final order is not lower after removal, or the sign fails to replicate.",
    citations: ["couzin2005"],
    knownAs: "exploratory",
    confirmatory: true,
    primary: "order",
    direction: "treatment-lower",
    confounds: ["Removal also lowers congestion. Order could rise if the survivors stop colliding. The prediction may be wrong, and that would be informative."],
    limitations: COMMON_LIMITS,
    coverage: [{ regen: "mid", temptation: "low", composition: "mixed" }],
    arms: (steps) => [
      { arm: "control", parameter: null, patch: { mix: MIXED, steps, removeAt: null } },
      {
        arm: "treatment",
        parameter: null,
        patch: { mix: MIXED, steps, removeAt: { step: Math.floor(steps / 2), fraction: 0.3 } },
      },
    ],
  },
  {
    id: "exp-noise",
    title: "Signal noise and harvest efficiency",
    domain: "Communication",
    question: "With a short vision range, does flipping the 'resource here' signal half the time reduce efficiency relative to a clean signal?",
    hypothesis: "Noise should reduce the value of the hand-built signal. This tests the channel, not language emergence.",
    alternative: "Local vision is enough, so the signal and its noise do not move efficiency.",
    falsify: "Rejected if the noisy channel is not less efficient, or the sign fails to replicate.",
    citations: ["foerster2016", "lazaridou2017", "shannon1948"],
    knownAs: "expected-mechanism",
    confirmatory: true,
    primary: "efficiency",
    direction: "treatment-lower",
    confounds: ["The signal is programmed. A benefit is not an evolved protocol. Agents also still see a one-cell neighbourhood."],
    limitations: [...COMMON_LIMITS, "Do not describe the bit as a language or as semantic communication."],
    coverage: [{ regen: "mid", temptation: "low", composition: "homogeneous" }],
    arms: two(
      { mix: SIGNALERS, communication: true, signalNoise: 0, vision: 1 },
      { mix: SIGNALERS, communication: true, signalNoise: 0.5, vision: 1 },
    ),
  },
  {
    id: "exp-hysteresis",
    title: "Direction of a temptation ramp",
    domain: "Path dependence",
    question: "Does ramping temptation up versus down leave different late sharing when both ramps span the same range?",
    hypothesis: "Exploratory. A gap that replicates would be history dependence of the sharing rate. It is not automatically hysteresis in the dynamical-systems sense.",
    alternative: "Late sharing tracks only the final multiplier, which is similar, so the arms match.",
    falsify: "Do not infer hysteresis from two noisy runs. Require a replicated arm difference.",
    citations: ["arthur1989", "nowak1992"],
    knownAs: "exploratory",
    confirmatory: false,
    primary: "lateCooperation",
    direction: "exploratory",
    confounds: ["The two schedules are not exact time-reversals of one trajectory. They are two open-loop ramps."],
    limitations: [...COMMON_LIMITS, "Hysteresis is not claimed unless a later design shows a loop that survives controls. This arm only compares endpoints."],
    coverage: [
      { regen: "mid", temptation: "low", composition: "mixed" },
      { regen: "mid", temptation: "high", composition: "mixed" },
    ],
    arms: two(
      { mix: SOCIAL, schedule: "tempt-up", temptationEnd: 2.1, memory: 4 },
      { mix: SOCIAL, schedule: "tempt-down", temptationEnd: 2.1, memory: 4 },
    ),
  },
  {
    id: "exp-null",
    title: "Null world: identical arms",
    domain: "Instrument",
    question: "How often does the confirmatory pipeline report a difference when the two arms are the same configuration?",
    hypothesis: "A well-behaved test should usually not reject. A rejection is a false alarm, not a phenomenon.",
    alternative: "The pipeline manufactures significance.",
    falsify: "If raw p is below 0.05, record a false alarm. Do not explain it as emergence.",
    citations: ["liu2008"],
    knownAs: "instrument",
    confirmatory: false,
    primary: "meanEnergy",
    direction: "exploratory",
    confounds: ["With few trials, a false alarm remains possible. One alarm does not by itself prove the test is invalid; a high rate would."],
    limitations: ["Instrument check only."],
    coverage: [{ regen: "mid", temptation: "low", composition: "mixed" }],
    arms: two({ mix: MIXED }, { mix: MIXED }),
  },
  {
    id: "exp-planted",
    title: "Planted mean-shift",
    domain: "Instrument",
    question: "Can the mean-shift scanner recover a step planted at a known index?",
    hypothesis: "The scanner should land within three samples of the planted index and clear z ≥ 5 on most seeds.",
    alternative: "The scanner locks onto noise.",
    falsify: "A miss rate above half the seeds means the detector is not ready to narrate change-points.",
    citations: ["liu2008", "vicsek1995"],
    knownAs: "instrument",
    confirmatory: false,
    primary: "order",
    direction: "exploratory",
    confounds: ["Synthetic series are not agent behaviour."],
    limitations: ["Does not validate the scanner on every shape of change, only on a step plus small noise."],
    coverage: [],
    instrument: "planted",
    arms: () => [],
  },
  {
    id: "exp-false-positive",
    title: "Detector false alarms on noise",
    domain: "Instrument",
    question: "How often does the mean-shift scanner clear z ≥ 5 on a nearly flat noisy series?",
    hypothesis: "The rate should be low. The exact false-positive probability is not theoretically claimed.",
    alternative: "The threshold is so loose that noise is routinely promoted.",
    falsify: "If more than a third of noise series clear z ≥ 5, the threshold is miscalibrated for narration.",
    citations: ["liu2008", "bak1987"],
    knownAs: "instrument",
    confirmatory: false,
    primary: "order",
    direction: "exploratory",
    confounds: ["The noise amplitude is chosen by the lab. Another amplitude would change the rate."],
    limitations: ["Not a formal type-I error proof for the Welch tests. This checks the change-point scanner only."],
    coverage: [],
    instrument: "false-positive",
    arms: () => [],
  },
];

function seedFromSpec(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) + 20;
}

export function specById(id: string): ExperimentSpec | undefined {
  return SPECS.find((s) => s.id === id);
}

let haltFlag = false;
export function requestHalt() {
  haltFlag = true;
}
export function clearHalt() {
  haltFlag = false;
}
export function isHalted() {
  return haltFlag;
}

export interface RunOptions {
  trials: number;
  steps: number;
  seedBase?: number;
  cores?: number | null;
  userAgent?: string;
}

const ASSUMPTIONS = [
  "Two-sided tests. α = 0.05 is a reporting threshold, not a discovery switch.",
  "Welch's t assumes independent trials and finite variance. Normality is approximate; trials are i.i.d. given the configuration.",
  "Power uses a normal approximation for equal groups and equal variance at Cohen's d = 0.5. It is an estimate.",
  "The bootstrap interval is a percentile interval of the mean difference, 400 resamples, not a bias-corrected interval.",
  "Bonferroni is applied only across confirmatory specs in the same programme. It is conservative and ignores dependence.",
];

export async function runSpec(
  spec: ExperimentSpec,
  options: RunOptions,
  onTick?: (label: string) => void,
): Promise<ExperimentRecord> {
  const createdAt = new Date().toISOString();
  const seedBase = options.seedBase ?? seedFromSpec(spec.id);
  const steps = options.steps;
  try {
    if (spec.instrument === "planted") return instrumentPlanted(spec, options, seedBase, createdAt);
    if (spec.instrument === "false-positive") return instrumentNoise(spec, options, seedBase, createdAt);
    const arms = spec.arms(steps);
    const sweep = new Set(arms.map((a) => a.parameter).filter((p): p is number => p != null)).size >= 3;
    const blocks: Array<1 | 2> = sweep ? [1] : [1, 2];
    const primary: TrialRecord[] = [];
    const replicate: TrialRecord[] = [];
    let replay: Replay | null = null;
    const quality: string[] = [];
    let done = 0;
    for (const block of blocks) {
      for (const arm of arms) {
        for (let i = 0; i < options.trials; i++) {
          if (haltFlag) {
            return haltedRecord(spec, options, seedBase, createdAt, primary, quality);
          }
          const seed = (seedBase + block * 10007 + i * 97 + Math.round((arm.parameter ?? 0) * 10) * 13) >>> 0;
          onTick?.(`${spec.title} · ${arm.arm} · seed ${seed}`);
          const raw = runSim({ ...arm.patch, seed, steps });
          const trial = toTrialRecord(block === 1 ? arm.arm : `${arm.arm}·rep`, seed, arm.parameter, raw);
          quality.push(...qualityIssues(raw.metrics, raw.issues).map((q) => `${arm.arm}/${seed}: ${q}`));
          if (block === 1) primary.push(trial);
          else replicate.push(trial);
          if (!replay && block === 1 && arm.arm === arms[0].arm && i === 0) {
            replay = { width: raw.width, height: raw.height, arm: arm.arm, seed, frames: raw.frames };
          }
          done++;
          if (done % 2 === 0) await yieldThread();
        }
      }
    }
    const analysis = analyse(spec, primary, replicate, seedBase);
    const provenance = makeProvenance(spec, options, seedBase, createdAt, arms);
    const draft: ExperimentRecord = {
      ...shell(spec, provenance, primary.concat(replicate), analysis, replay, quality),
    };
    const judged = judge(draft);
    return { ...draft, ...judged };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const provenance = makeProvenance(spec, options, seedBase, createdAt, []);
    const draft = shell(spec, provenance, [], emptyAnalysis(spec), null, []);
    return {
      ...draft,
      status: "failed",
      classification: "measurement-failure",
      discoveryLevel: 0,
      levelRationale: "The runner threw before a result existed.",
      failure: { category: "software", message },
    };
  }
}

function instrumentPlanted(spec: ExperimentSpec, options: RunOptions, seedBase: number, createdAt: string): ExperimentRecord {
  const hits: number[] = [];
  const zs: number[] = [];
  let lastIndex = -1;
  for (let i = 0; i < options.trials; i++) {
    const at = 20;
    const series = plantedStepSeries(48, at, 0.1, seedBase + i * 19);
    const cp = changePoint(series);
    const hit = cp.index >= 0 && Math.abs(cp.index - at) <= 3 && cp.z >= 5;
    hits.push(hit ? 1 : 0);
    zs.push(cp.z);
    lastIndex = cp.index;
  }
  const rate = mean(hits);
  const analysis = emptyAnalysis(spec);
  analysis.kind = "instrument";
  analysis.meanTreatment = rate;
  analysis.meanControl = 1;
  analysis.nTreatment = hits.length;
  analysis.notes = [
    `Hit rate ${rate.toFixed(2)} (within ±3 of index 20 and z ≥ 5). Mean scanner z ${mean(zs).toFixed(2)}. Last index ${lastIndex}.`,
  ];
  const provenance = makeProvenance(spec, options, seedBase, createdAt, []);
  const draft = shell(spec, provenance, [], analysis, null, rate < 0.5 ? ["planted-step hit rate below 0.5"] : []);
  return { ...draft, ...judge({ ...draft, dataQuality: rate < 0.5 ? draft.dataQuality : [] }) };
}

function instrumentNoise(spec: ExperimentSpec, options: RunOptions, seedBase: number, createdAt: string): ExperimentRecord {
  const alarms: number[] = [];
  for (let i = 0; i < Math.max(8, options.trials); i++) {
    const series = noiseSeries(48, seedBase + i * 23);
    const cp = changePoint(series);
    alarms.push(cp.z >= 5 ? 1 : 0);
  }
  const rate = mean(alarms);
  const analysis = emptyAnalysis(spec);
  analysis.kind = "instrument";
  analysis.meanTreatment = rate;
  analysis.nTreatment = alarms.length;
  analysis.notes = [`Fraction of flat noise series with mean-shift z ≥ 5: ${rate.toFixed(2)}. Threshold for concern in the falsification rule: 0.33.`];
  const provenance = makeProvenance(spec, options, seedBase, createdAt, []);
  const quality = rate > 0.33 ? ["change-point false-alarm rate above 0.33 on the noise probe"] : [];
  const draft = shell(spec, provenance, [], analysis, null, quality);
  return { ...draft, ...judge(draft) };
}

function analyse(spec: ExperimentSpec, primary: TrialRecord[], replicate: TrialRecord[], seedBase: number): AnalysisResult {
  const analysis = emptyAnalysis(spec);
  const metric = spec.primary;
  if (spec.direction === "greater-than-zero") {
    const xs = primary.map((t) => t.metrics[metric]);
    const xr = replicate.map((t) => t.metrics[metric]);
    const test = oneSampleT(xs, 0);
    const testR = oneSampleT(xr, 0);
    analysis.kind = "one-sample";
    analysis.nTreatment = xs.length;
    analysis.nControl = xs.length;
    analysis.meanTreatment = test.mean;
    analysis.meanControl = 0;
    analysis.sdTreatment = test.sd;
    analysis.sdControl = 0;
    analysis.t = test.t;
    analysis.df = test.df;
    analysis.pRaw = test.p;
    analysis.pAdjusted = test.p;
    analysis.effect = test.mean;
    analysis.hedgesG = test.sd > 1e-8 ? test.mean / test.sd : 0;
    const [lo, hi] = bootstrapMeanDiff(xs.map(() => 0), xs, seedBase + 3);
    analysis.ciLow = lo;
    analysis.ciHigh = hi;
    analysis.replicationEffect = testR.mean;
    analysis.replicationSameSign = Math.sign(test.mean) !== 0 && Math.sign(test.mean) === Math.sign(testR.mean) && testR.p < 0.1;
    analysis.powerAtObserved = approxTwoSamplePower(Math.abs(analysis.hedgesG), xs.length);
    analysis.powerAtSei = approxTwoSamplePower(0.5, xs.length);
    analysis.notes.push("One-sample test of clustering lift against zero. Replication requires the same sign and a loose p < 0.1 on the second block.");
    return analysis;
  }
  const params = [...new Set(primary.map((t) => t.parameter).filter((p): p is number => p != null))];
  if (params.length >= 3) {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const p of params.sort((a, b) => a - b)) {
      const slice = primary.filter((t) => t.parameter === p).map((t) => t.metrics[metric]);
      xs.push(p);
      ys.push(mean(slice));
    }
    const cp = changePoint(ys);
    analysis.kind = "sweep";
    analysis.nControl = primary.length;
    analysis.nTreatment = primary.length;
    analysis.meanControl = ys[0] ?? 0;
    analysis.meanTreatment = ys[ys.length - 1] ?? 0;
    analysis.sdControl = 0;
    analysis.sdTreatment = 0;
    analysis.effect = (ys[ys.length - 1] ?? 0) - (ys[0] ?? 0);
    analysis.spearman = spearman(xs, ys);
    analysis.changeIndex = cp.index;
    analysis.changeZ = cp.z;
    analysis.pRaw = 1;
    analysis.pAdjusted = 1;
    analysis.notes.push(
      `Sweep means: ${xs.map((x, i) => `${x}:${ys[i].toFixed(3)}`).join(", ")}. Slope ${linearSlope(xs, ys).toFixed(4)}. Spearman is descriptive; no p-value is reported for it.`,
    );
    return analysis;
  }
  const c = primary.filter((t) => t.arm === "control").map((t) => t.metrics[metric]);
  const t = primary.filter((t) => t.arm === "treatment").map((t) => t.metrics[metric]);
  const cr = replicate.filter((t) => t.arm === "control·rep").map((t) => t.metrics[metric]);
  const tr = replicate.filter((t) => t.arm === "treatment·rep").map((t) => t.metrics[metric]);
  const test = welchTTest(c, t);
  const testR = welchTTest(cr, tr);
  analysis.kind = "two-sample";
  analysis.nControl = c.length;
  analysis.nTreatment = t.length;
  analysis.meanControl = test.meanA;
  analysis.meanTreatment = test.meanB;
  analysis.sdControl = test.sdA;
  analysis.sdTreatment = test.sdB;
  analysis.t = test.t;
  analysis.df = test.df;
  analysis.pRaw = test.p;
  analysis.pAdjusted = test.p;
  analysis.effect = test.diff;
  analysis.hedgesG = hedgesG(c, t);
  const [lo, hi] = bootstrapMeanDiff(c, t, seedBase + 5);
  analysis.ciLow = lo;
  analysis.ciHigh = hi;
  analysis.replicationEffect = testR.diff;
  analysis.replicationSameSign = Math.sign(test.diff) !== 0 && Math.sign(test.diff) === Math.sign(testR.diff);
  const nArm = Math.min(c.length, t.length);
  analysis.powerAtObserved = approxTwoSamplePower(analysis.hedgesG, nArm);
  analysis.powerAtSei = approxTwoSamplePower(0.5, nArm);
  return analysis;
}

export function applyFamily(records: ExperimentRecord[]): ExperimentRecord[] {
  const family = records.filter((r) => r.analysis.confirmatory && r.failure == null && r.status !== "halted" && r.status !== "failed");
  const m = Math.max(1, family.length);
  return records.map((record) => {
    if (!record.analysis.confirmatory || record.failure) return record;
    const analysis: AnalysisResult = {
      ...record.analysis,
      familySize: m,
      pAdjusted: Math.min(1, record.analysis.pRaw * m),
    };
    const next = { ...record, analysis };
    return { ...next, ...judge(next) };
  });
}

function emptyAnalysis(spec: ExperimentSpec): AnalysisResult {
  return {
    kind: "none",
    metric: spec.primary,
    nControl: 0,
    nTreatment: 0,
    meanControl: 0,
    meanTreatment: 0,
    sdControl: 0,
    sdTreatment: 0,
    effect: 0,
    hedgesG: 0,
    t: 0,
    df: 0,
    pRaw: 1,
    pAdjusted: 1,
    familySize: 1,
    ciLow: Number.NaN,
    ciHigh: Number.NaN,
    powerAtObserved: Number.NaN,
    powerAtSei: Number.NaN,
    smallestEffectOfInterest: 0.5,
    replicationSameSign: null,
    replicationEffect: null,
    spearman: null,
    changeIndex: null,
    changeZ: null,
    confirmatory: spec.confirmatory,
    assumptions: ASSUMPTIONS,
    notes: [],
  };
}

function shell(
  spec: ExperimentSpec,
  provenance: Provenance,
  trials: TrialRecord[],
  analysis: AnalysisResult,
  replay: Replay | null,
  dataQuality: string[],
): ExperimentRecord {
  return {
    id: `${spec.id}-${provenance.configHash}-${provenance.createdAt.slice(11, 19).replace(/:/g, "")}`,
    specId: spec.id,
    title: spec.title,
    domain: spec.domain,
    question: spec.question,
    hypothesis: spec.hypothesis,
    alternative: spec.alternative,
    falsify: spec.falsify,
    direction: spec.direction,
    status: "completed",
    primaryMetric: spec.primary,
    citations: spec.citations,
    knownAs: spec.knownAs,
    trials,
    analysis,
    classification: "inconclusive",
    discoveryLevel: 0,
    levelRationale: "",
    reviews: [],
    provenance,
    replay,
    dataQuality,
    limitations: spec.limitations,
    confounds: spec.confounds,
    failure: null,
  };
}

function haltedRecord(
  spec: ExperimentSpec,
  options: RunOptions,
  seedBase: number,
  createdAt: string,
  trials: TrialRecord[],
  quality: string[],
): ExperimentRecord {
  const provenance = makeProvenance(spec, options, seedBase, createdAt, []);
  const draft = shell(spec, provenance, trials, emptyAnalysis(spec), null, quality);
  draft.status = "halted";
  draft.failure = { category: "safety-stop", message: "Stopped by the operator between trials. Partial trials were kept." };
  return { ...draft, ...judge(draft) };
}

function makeProvenance(
  spec: ExperimentSpec,
  options: RunOptions,
  seedBase: number,
  createdAt: string,
  arms: ArmPlan[],
): Provenance {
  const payload = JSON.stringify({ spec: spec.id, steps: options.steps, trials: options.trials, seedBase, arms, engine: ENGINE_ID });
  return {
    app: "OMEIL",
    version: APP_VERSION,
    engine: ENGINE_ID,
    rng: "mulberry32",
    configHash: hashString(payload),
    createdAt,
    trialsPerArm: options.trials,
    steps: options.steps,
    cores: options.cores ?? null,
    userAgent: options.userAgent ?? "unknown",
    synthetic: true,
  };
}

function yieldThread(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function programmeSpecs(): ExperimentSpec[] {
  return SPECS;
}

export function coverageFor(specIds: string[]): { cell: CoverageCell; specs: string[] }[] {
  const cells: CoverageCell[] = [];
  for (const regen of ["low", "mid", "high"] as const) {
    for (const temptation of ["low", "mid", "high"] as const) {
      for (const composition of ["homogeneous", "mixed"] as const) {
        cells.push({ regen, temptation, composition });
      }
    }
  }
  return cells.map((cell) => ({
    cell,
    specs: SPECS.filter((s) => specIds.includes(s.id) && s.coverage.some((c) => sameCell(c, cell))).map((s) => s.id),
  }));
}

function sameCell(a: CoverageCell, b: CoverageCell): boolean {
  return a.regen === b.regen && a.temptation === b.temptation && a.composition === b.composition;
}

export function trialRows(record: ExperimentRecord): string {
  const header = ["arm", "seed", "parameter", ...metricKeys()];
  const lines = [header.join(",")];
  for (const t of record.trials) {
    lines.push(
      [csv(t.arm), String(t.seed), t.parameter ?? "", ...metricKeys().map((k) => String(t.metrics[k]))].join(","),
    );
  }
  return lines.join("\n");
}

function metricKeys(): (keyof Metrics)[] {
  return [
    "cooperation",
    "lateCooperation",
    "meanEnergy",
    "gini",
    "order",
    "efficiency",
    "perCapitaHarvest",
    "survival",
    "assortativity",
    "clustering",
    "clusteringLift",
    "entropy",
    "mutualInfo",
    "meanDegree",
    "recovery",
  ];
}

function csv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function meanByArm(record: ExperimentRecord, metric: keyof Metrics): { arm: string; mean: number; sd: number }[] {
  const arms = [...new Set(record.trials.map((t) => t.arm))];
  return arms.map((arm) => {
    const xs = record.trials.filter((t) => t.arm === arm).map((t) => t.metrics[metric]);
    return { arm, mean: xs.length ? mean(xs) : 0, sd: sampleSd(xs) };
  });
}
