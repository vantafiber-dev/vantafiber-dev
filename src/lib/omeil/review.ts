import { paperById } from "./literature.ts";
import type { AnalysisResult, ClaimClass, ExperimentRecord, Review } from "./types.ts";
import { APP_VERSION } from "./types.ts";

const MAX_LEVEL = 2 as const;

export function judge(
  record: Pick<
    ExperimentRecord,
    "analysis" | "knownAs" | "dataQuality" | "status" | "direction" | "hypothesis"
  >,
): Pick<ExperimentRecord, "classification" | "discoveryLevel" | "levelRationale" | "status"> {
  const a = record.analysis;
  if (record.status === "failed" || record.status === "halted") {
    return {
      status: record.status,
      classification: record.status === "halted" ? "halted" : "measurement-failure",
      discoveryLevel: 0,
      levelRationale: "The run did not finish. No scientific claim is attached.",
    };
  }
  if (record.dataQuality.length > 0 || record.status === "measurement-failure") {
    return {
      status: "measurement-failure",
      classification: "measurement-failure",
      discoveryLevel: 0,
      levelRationale: `Data-quality checks failed (${record.dataQuality.join("; ")}). Excluded from discovery claims.`,
    };
  }
  if (a.kind === "instrument") {
    return {
      status: "completed",
      classification: "instrument-check",
      discoveryLevel: 0,
      levelRationale:
        "This is a known-answer or noise probe of a detector. It validates software. It is not evidence about a natural or unprogrammed phenomenon.",
    };
  }
  if (record.knownAs === "instrument") {
    if (a.pRaw < 0.05) {
      return {
        status: "completed",
        classification: "unusual-vs-prediction",
        discoveryLevel: 0,
        levelRationale:
          "The arms were configured to match, but the raw test crossed α = 0.05. That is a false alarm of the procedure, not a phenomenon. It is not promoted.",
      };
    }
    return {
      status: "completed",
      classification: "instrument-check",
      discoveryLevel: 0,
      levelRationale:
        "Identical arms did not cross α = 0.05. Negative control of the test only. It does not prove the metric cannot change under other interventions.",
    };
  }

  const sigRaw = a.pRaw < 0.05;
  const sigAdj = a.pAdjusted < 0.05;
  const matched = directionMatches(record.direction, a);
  const replicated = a.replicationSameSign === true;
  const underpowered = a.powerAtSei < 0.8;
  const g = Math.abs(a.hedgesG);

  if (a.kind === "sweep") {
    const strong = (a.changeZ ?? 0) >= 5 || Math.abs(a.spearman ?? 0) >= 0.6;
    return {
      status: strong ? "completed" : "inconclusive",
      classification: strong ? "exploratory-pattern" : "inconclusive",
      discoveryLevel: strong ? 1 : 0,
      levelRationale: strong
        ? "The sweep shows a structured association or a mean-shift. That is an exploratory pattern inside this model, not a phase transition and not a novelty claim."
        : "The sweep does not show a strong monotone association or a sharp mean-shift under the pre-set thresholds. Absence of a threshold here is not evidence that no threshold exists at other resolutions.",
    };
  }

  if (!sigRaw) {
    if (underpowered || a.nControl < 6) {
      return {
        status: "inconclusive",
        classification: "inconclusive",
        discoveryLevel: 0,
        levelRationale:
          "The contrast was not statistically detectable at α = 0.05, and the approximate power at the pre-set smallest effect of interest (Hedges-style d = 0.5) is below 0.8 or the sample is small. This is inconclusive. It is not evidence of no effect.",
      };
    }
    return {
      status: "completed",
      classification: "no-detectable-effect",
      discoveryLevel: 0,
      levelRationale:
        "No difference was detected at α = 0.05, and approximate power at d = 0.5 was at least 0.8 under normal two-sample assumptions. That still only concerns this metric, model, and sample. It is not a universal null.",
    };
  }

  if (!matched && record.direction !== "exploratory") {
    return {
      status: "completed",
      classification: "unusual-vs-prediction",
      discoveryLevel: replicated ? 1 : 0,
      levelRationale: replicated
        ? "The contrast is repeatable across seed blocks but points opposite the preregistered direction. The prediction is not supported. The opposite pattern is recorded, not promoted to a discovery."
        : "A raw difference opposes the prediction, but the replication block did not keep the same sign. Treated as unresolved.",
    };
  }

  if (!replicated) {
    return {
      status: "inconclusive",
      classification: "not-replicated",
      discoveryLevel: 0,
      levelRationale:
        "The first seed block crossed α = 0.05, but an independent seed block did not keep the same sign. The result is not treated as repeatable.",
    };
  }

  const klass = classFor(record.knownAs);
  let level: 0 | 1 | 2 = 1;
  if (sigAdj && g >= 0.5 && a.confirmatory) level = 2;
  else if (g < 0.2) level = 0;
  level = Math.min(level, MAX_LEVEL) as 0 | 1 | 2;

  const familyNote =
    a.familySize > 1 && !sigAdj
      ? ` It does not survive a Bonferroni adjustment across ${a.familySize} confirmatory tests (adjusted p = ${fmt(a.pAdjusted)}).`
      : a.familySize > 1
        ? ` It still clears a Bonferroni adjustment across ${a.familySize} confirmatory tests.`
        : "";

  return {
    status: "completed",
    classification: klass,
    discoveryLevel: level,
    levelRationale:
      (level >= 2
        ? "Repeatable within this implementation, at or above the pre-set effect-size bar, after multiplicity adjustment."
        : "Repeatable in sign across two seed blocks, but either the effect is modest or it does not clear the multiplicity bar. Kept below the 'validated phenomenon' bar.") +
      " " +
      scopeSentence(klass) +
      familyNote +
      " Level 3 or higher is unavailable: there is no second implementation and no external replication.",
  };
}

function directionMatches(direction: ExperimentRecord["direction"], a: AnalysisResult): boolean {
  const delta = a.meanTreatment - a.meanControl;
  if (direction === "exploratory") return true;
  if (direction === "treatment-higher") return delta > 0;
  if (direction === "treatment-lower") return delta < 0;
  if (direction === "greater-than-zero") return a.meanTreatment > 0;
  return false;
}

function classFor(knownAs: ExperimentRecord["knownAs"]): ClaimClass {
  if (knownAs === "expected-mechanism") return "expected-consequence";
  if (knownAs === "related-literature") return "previously-reported";
  if (knownAs === "instrument") return "instrument-check";
  return "exploratory-pattern";
}

function scopeSentence(klass: ClaimClass): string {
  if (klass === "expected-consequence") {
    return "The direction matches a mechanism this model was built to express. That is a positive control of the instrument, not an unanticipated phenomenon.";
  }
  if (klass === "previously-reported") {
    return "The direction is consistent with a previously published class of results. This run is not an independent reproduction of those experiments, and it is not a novelty claim.";
  }
  if (klass === "exploratory-pattern") {
    return "No directional prediction was preregistered. The pattern stays exploratory until a later confirmatory design distinguishes it from alternatives.";
  }
  return "Scope is limited to this synthetic model.";
}

export function makeReviews(record: ExperimentRecord): Review[] {
  const a = record.analysis;
  const cite = record.citations
    .map((id) => paperById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => `${p.authors.split(",")[0]} ${p.year}`)
    .join("; ");
  const delta = a.meanTreatment - a.meanControl;
  return [
    {
      role: "Principal Research Director",
      agentId: "director",
      dissent: false,
      text: `Question: ${record.question} Primary metric ${a.metric}. Control mean ${fmt(a.meanControl)}, treatment mean ${fmt(a.meanTreatment)} (difference ${fmt(delta)}). Classification ${record.classification}, maturity level ${record.discoveryLevel}. ${record.levelRationale}`,
    },
    {
      role: "Literature Intelligence",
      agentId: "literature",
      dissent: false,
      text: cite
        ? `Bibliographic neighbours: ${cite}. Full text was not inspected; only title, venue, and DOI were stored. Do not treat a DOI match as a sentence-level citation check. No result in this build is labelled candidate-novel.`
        : "No bibliographic neighbour was attached. That is a coverage gap in the library, not evidence of novelty.",
    },
    {
      role: "Hypothesis Discovery",
      agentId: "hypothesis",
      dissent: false,
      text: `Preregistered hypothesis: ${record.hypothesis} Alternative: ${record.alternative} Observed difference (treatment − control) = ${fmt(delta)}. Falsification rule: ${record.falsify}`,
    },
    {
      role: "Contrarian Research",
      agentId: "contrarian",
      dissent: true,
      text: contrarian(record),
    },
    {
      role: "Experimental Design",
      agentId: "design",
      dissent: false,
      text: `Arms compared under a shared patch seed. Trials per arm in the primary block: control ${a.nControl}, treatment ${a.nTreatment}. Steps ${record.provenance.steps}. Confirmatory: ${a.confirmatory ? "yes" : "no"}. Smallest effect of interest used for the power approximation: d = ${a.smallestEffectOfInterest}. Assumptions: ${a.assumptions.join(" ")}`,
    },
    {
      role: "Simulation Engineer",
      agentId: "engineer",
      dissent: false,
      text: `Engine ${record.provenance.engine}, RNG ${record.provenance.rng}, config hash ${record.provenance.configHash}, app ${record.provenance.version}. Synthetic data. Replay frames, where stored, are quantised resource fields plus agent coordinates, not a second physics.`,
    },
    {
      role: "Behavioural Anomaly Hunter",
      agentId: "anomaly",
      dissent: false,
      text:
        a.changeIndex != null && a.changeZ != null
          ? `Mean-shift scan index ${a.changeIndex}, z ${fmt(a.changeZ)}. A candidate change-point is only a description of the series. It is not, by itself, a phase transition, a critical point, or an anomaly worth a paper.`
          : "No population sweep curve was scanned for this record. Trial-level series remain available for a manual mean-shift.",
    },
    {
      role: "Statistical Auditor",
      agentId: "auditor",
      dissent: a.pRaw < 0.05 && a.pAdjusted >= 0.05,
      text: `Welch or one-sample t = ${fmt(a.t)} on ${fmt(a.df)} df. Raw p = ${fmtP(a.pRaw)}. Bonferroni family size ${a.familySize}, adjusted p = ${fmtP(a.pAdjusted)}. Hedges g = ${fmt(a.hedgesG)}. Bootstrap percentile interval for the mean difference [${fmt(a.ciLow)}, ${fmt(a.ciHigh)}]. Approximate power at the observed effect ${fmt(a.powerAtObserved)}; at d = 0.5, ${fmt(a.powerAtSei)}. ${a.replicationSameSign == null ? "Replication was not required for this design." : a.replicationSameSign ? "Replication block kept the sign." : "Replication block flipped or lost the sign."}`,
    },
    {
      role: "Behavioural Interpretation",
      agentId: "interpretation",
      dissent: false,
      text: "Observable record: actions, positions, harvests, and graph statistics. Proposed mechanism: whatever the configuration's rules already implement. Interpretation stays inside those rules. Nothing here is evidence of awareness, intent, emotion, or understanding. Mutual information is statistical dependence, not meaning.",
    },
    {
      role: "AI Safety",
      agentId: "safety",
      dissent: false,
      text: "The run stayed inside a bounded local simulator. It did not call a model provider, touch a network service, or leave the browser tab's memory. Do not export these traces as instructions for real infrastructure, finance, or offensive security.",
    },
    {
      role: "Reproducibility",
      agentId: "reproducibility",
      dissent: a.replicationSameSign === false,
      text: `Primary seed base is inside the trial list. A second block, when present, uses an offset seed stream and the same configuration hash. Software version ${APP_VERSION}. An independent reimplementation was not run, so maturity stops at level 2.`,
    },
    {
      role: "Publication",
      agentId: "publication",
      dissent: record.discoveryLevel >= 2,
      text: "I will not upgrade wording. Allowed phrases are the classification and the level rationale. Forbidden: 'never discovered before', 'proves', 'conscious', 'emergent intelligence' as a claim about this number. Figures must be regenerated from the stored trials.",
    },
  ];
}

function contrarian(record: ExperimentRecord): string {
  const bits = [...record.confounds];
  const byArm = new Map<string, number[]>();
  for (const t of record.trials) {
    const arr = byArm.get(t.arm) ?? [];
    arr.push(t.metrics.survival);
    byArm.set(t.arm, arr);
  }
  const means = [...byArm.entries()].map(([arm, xs]) => ({ arm, m: avg(xs) }));
  if (means.length >= 2) {
    const hi = Math.max(...means.map((m) => m.m));
    const lo = Math.min(...means.map((m) => m.m));
    if (hi - lo > 0.2) {
      bits.push(
        `Survival differs by ${(hi - lo).toFixed(2)} across arms. Mean energy then mixes behaviour with how many agents are already at zero. That is a composition confound.`,
      );
    }
  }
  if (record.analysis.familySize > 1) {
    bits.push("This test sits in a family. Raw significance is the wrong headline if the adjusted p is large.");
  }
  bits.push("Two seed blocks share one codebase. Agreement is not an independent replication.");
  return bits.join(" ");
}

function avg(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "n/a";
  const a = Math.abs(n);
  if (a !== 0 && (a < 0.001 || a >= 1000)) return n.toExponential(2);
  return n.toFixed(3);
}

export function fmtP(p: number): string {
  if (!Number.isFinite(p)) return "n/a";
  if (p < 0.001) return p.toExponential(2);
  return p.toFixed(3);
}

export function renderReport(record: ExperimentRecord): string {
  const a = record.analysis;
  const lines = [
    `# ${record.title}`,
    ``,
    `OMEIL ${record.provenance.version} · engine ${record.provenance.engine} · ${record.provenance.createdAt}`,
    ``,
    `**Synthetic data.** This report was generated from stored trials. It is not a peer-reviewed paper.`,
    ``,
    `## Research question`,
    record.question,
    ``,
    `## Hypothesis`,
    record.hypothesis,
    ``,
    `## Alternative`,
    record.alternative,
    ``,
    `## Falsification`,
    record.falsify,
    ``,
    `## Design`,
    `- Domain: ${record.domain}`,
    `- Primary metric: ${a.metric}`,
    `- Direction: ${record.direction}`,
    `- Confirmatory: ${a.confirmatory ? "yes" : "no — exploratory or instrument"}`,
    `- Trials (primary block): control ${a.nControl}, treatment ${a.nTreatment}`,
    `- Steps: ${record.provenance.steps}`,
    `- Config hash: ${record.provenance.configHash}`,
    `- RNG: ${record.provenance.rng}`,
    ``,
    `## Results`,
    `- Control mean: ${fmt(a.meanControl)} (sd ${fmt(a.sdControl)})`,
    `- Treatment mean: ${fmt(a.meanTreatment)} (sd ${fmt(a.sdTreatment)})`,
    `- Difference (treatment − control): ${fmt(a.meanTreatment - a.meanControl)}`,
    `- Hedges g: ${fmt(a.hedgesG)}`,
    `- t = ${fmt(a.t)}, df = ${fmt(a.df)}`,
    `- Raw p: ${fmtP(a.pRaw)}`,
    `- Adjusted p (Bonferroni, family ${a.familySize}): ${fmtP(a.pAdjusted)}`,
    `- Bootstrap 95% interval: [${fmt(a.ciLow)}, ${fmt(a.ciHigh)}]`,
    `- Approximate power at observed effect: ${fmt(a.powerAtObserved)}`,
    `- Approximate power at d = ${a.smallestEffectOfInterest}: ${fmt(a.powerAtSei)}`,
    `- Replication same sign: ${a.replicationSameSign == null ? "not applicable" : a.replicationSameSign ? "yes" : "no"}`,
    a.spearman == null ? "" : `- Spearman (sweep): ${fmt(a.spearman)}`,
    a.changeZ == null ? "" : `- Mean-shift z: ${fmt(a.changeZ)} at index ${a.changeIndex}`,
    ``,
    `## Classification`,
    `- Class: ${record.classification}`,
    `- Maturity level: ${record.discoveryLevel} of 5 (this build never assigns 3, 4, or 5)`,
    `- Rationale: ${record.levelRationale}`,
    ``,
    `## Assumptions`,
    ...a.assumptions.map((s) => `- ${s}`),
    ``,
    `## Confounds the contrarian insisted on keeping`,
    ...record.confounds.map((s) => `- ${s}`),
    ``,
    `## Limitations`,
    ...record.limitations.map((s) => `- ${s}`),
    ``,
    `## Data quality`,
    record.dataQuality.length ? record.dataQuality.map((s) => `- ${s}`).join("\n") : "- No failed checks recorded.",
    ``,
    `## Dissent`,
    ...record.reviews.filter((r) => r.dissent).map((r) => `- **${r.role}.** ${r.text}`),
    ``,
    `## Literature neighbours`,
    ...(record.citations.length
      ? record.citations.map((id) => {
          const p = paperById(id);
          return p ? `- ${p.authors} (${p.year}). ${p.title}. ${p.venue}. https://doi.org/${p.doi} — full text not inspected.` : `- Missing record ${id}`;
        })
      : ["- None attached."]),
    ``,
    `## What this is not`,
    `- Not evidence of consciousness, intention, or understanding.`,
    `- Not a claim that the pattern was previously unknown.`,
    `- Not a causal estimate outside this simulator. Inside the simulator the intervention is the configuration change, under a shared random-seed policy.`,
    `- Not Isolation Forest output. The shipped detector is a mean-shift scan plus fingerprint distance.`,
    ``,
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}
