export const APP_VERSION = "0.9.0";
export const ENGINE_ID = "spatial-commons-1.0.0";

export type Strategy = "cooperator" | "defector" | "conditional" | "forager";

export type Schedule =
  | "none"
  | "scarce-then-rich"
  | "rich-then-scarce"
  | "tempt-up"
  | "tempt-down";

export type Observability = "local" | "shuffled" | "blind";

export interface SimConfig {
  width: number;
  height: number;
  agents: number;
  mix: Record<Strategy, number>;
  steps: number;
  seed: number;
  vision: number;
  regen: number;
  harvest: number;
  metabolism: number;
  share: number;
  shareNoise: number;
  temptation: number;
  temptationEnd: number;
  memory: number;
  communication: boolean;
  signalNoise: number;
  observability: Observability;
  patches: number;
  interactionRadius: number;
  schedule: Schedule;
  solo: boolean;
  perturbation: { start: number; end: number; regen: number } | null;
  removeAt: { step: number; fraction: number } | null;
}

export interface Metrics {
  cooperation: number;
  lateCooperation: number;
  meanEnergy: number;
  gini: number;
  order: number;
  efficiency: number;
  perCapitaHarvest: number;
  survival: number;
  assortativity: number;
  clustering: number;
  clusteringLift: number;
  entropy: number;
  mutualInfo: number;
  meanDegree: number;
  recovery: number;
}

export interface SeriesPoint {
  t: number;
  cooperation: number;
  energy: number;
  order: number;
  resource: number;
}

export interface FrameAgent {
  id: number;
  x: number;
  y: number;
  strategy: Strategy;
  energy: number;
  alive: boolean;
}

export interface Frame {
  t: number;
  agents: FrameAgent[];
  /** Base64 bytes, resource/1.5 scaled to 0–255, row-major. */
  resources: string;
  edges: [number, number][];
}

export interface TrialRecord {
  seed: number;
  arm: string;
  parameter: number | null;
  metrics: Metrics;
  series: SeriesPoint[];
}

export interface Replay {
  width: number;
  height: number;
  arm: string;
  seed: number;
  frames: Frame[];
}

export type ClaimClass =
  | "instrument-check"
  | "no-detectable-effect"
  | "inconclusive"
  | "expected-consequence"
  | "previously-reported"
  | "unusual-vs-prediction"
  | "not-replicated"
  | "measurement-failure"
  | "halted"
  | "exploratory-pattern";

export interface AnalysisResult {
  kind: "two-sample" | "one-sample" | "sweep" | "instrument" | "none";
  metric: keyof Metrics | "planted-index" | "false-positive";
  nControl: number;
  nTreatment: number;
  meanControl: number;
  meanTreatment: number;
  sdControl: number;
  sdTreatment: number;
  effect: number;
  hedgesG: number;
  t: number;
  df: number;
  pRaw: number;
  pAdjusted: number;
  familySize: number;
  ciLow: number;
  ciHigh: number;
  powerAtObserved: number;
  powerAtSei: number;
  smallestEffectOfInterest: number;
  replicationSameSign: boolean | null;
  replicationEffect: number | null;
  spearman: number | null;
  changeIndex: number | null;
  changeZ: number | null;
  confirmatory: boolean;
  assumptions: string[];
  notes: string[];
}

export interface Review {
  role: string;
  agentId: string;
  dissent: boolean;
  text: string;
}

export interface Provenance {
  app: string;
  version: string;
  engine: string;
  rng: string;
  configHash: string;
  createdAt: string;
  trialsPerArm: number;
  steps: number;
  cores: number | null;
  userAgent: string;
  synthetic: true;
}

export interface ExperimentRecord {
  id: string;
  specId: string;
  title: string;
  domain: string;
  question: string;
  hypothesis: string;
  alternative: string;
  falsify: string;
  direction: "treatment-higher" | "treatment-lower" | "exploratory" | "greater-than-zero";
  status: "completed" | "inconclusive" | "measurement-failure" | "halted" | "failed";
  primaryMetric: keyof Metrics | "planted-index" | "false-positive";
  citations: string[];
  knownAs: "expected-mechanism" | "related-literature" | "instrument" | "exploratory";
  trials: TrialRecord[];
  analysis: AnalysisResult;
  classification: ClaimClass;
  discoveryLevel: 0 | 1 | 2 | 3 | 4 | 5;
  levelRationale: string;
  reviews: Review[];
  provenance: Provenance;
  replay: Replay | null;
  dataQuality: string[];
  limitations: string[];
  confounds: string[];
  failure: { category: string; message: string } | null;
}

export interface SelfTest {
  id: string;
  name: string;
  passed: boolean;
  detail: string;
  at: string;
}

export interface LabSettings {
  trials: number;
  steps: number;
  reducedMotion: boolean;
  autonomy: "manual" | "assisted";
}

export interface LogEntry {
  at: string;
  level: "info" | "warn" | "stop" | "error";
  message: string;
}

export interface CoverageCell {
  regen: "low" | "mid" | "high";
  temptation: "low" | "mid" | "high";
  composition: "homogeneous" | "mixed";
}
