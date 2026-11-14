import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runSelfTests } from "./selftest.ts";
import { judge } from "./review.ts";

describe("OMEIL engine", () => {
  it("passes the known-answer self tests", async () => {
    const tests = await runSelfTests();
    const failed = tests.filter((t) => !t.passed);
    assert.deepEqual(
      failed.map((t) => `${t.id}: ${t.detail}`),
      [],
    );
  });

  it("does not treat a repeatable programmed effect as level 3+", () => {
    const result = judge({
      analysis: {
        kind: "two-sample",
        metric: "meanEnergy",
        nControl: 20,
        nTreatment: 20,
        meanControl: 3,
        meanTreatment: 1,
        sdControl: 0.2,
        sdTreatment: 0.2,
        effect: -2,
        hedgesG: -2,
        t: -8,
        df: 38,
        pRaw: 1e-8,
        pAdjusted: 1e-8,
        familySize: 1,
        ciLow: -2.4,
        ciHigh: -1.6,
        powerAtObserved: 0.99,
        powerAtSei: 0.9,
        smallestEffectOfInterest: 0.5,
        replicationSameSign: true,
        replicationEffect: -1.8,
        spearman: null,
        changeIndex: null,
        changeZ: null,
        confirmatory: true,
        assumptions: [],
        notes: [],
      },
      knownAs: "related-literature",
      dataQuality: [],
      status: "completed",
      direction: "treatment-lower",
      hypothesis: "lower",
    });
    assert.ok(result.discoveryLevel <= 2);
    assert.notEqual(result.classification, "exploratory-pattern");
    assert.match(result.levelRationale, /not a novelty claim|not an independent replication|Level 3/i);
  });
});
