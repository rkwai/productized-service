import assert from "node:assert/strict";

import { buildExecutiveBrief } from "../../src/lib/executive-brief.js";

const brief = buildExecutiveBrief({
  portfolioLtvCacRatio: 4.2,
  avgCacPaybackMonths: 7.5,
  roiCoveragePct: 80,
  mostProfitableSegment: {
    segment: "Core",
    profitShare: 62,
    ltvCacRatio: 5.1,
    spendDelta: 8,
    spendAction: "Increase spend",
  },
  bestRoiSegment: {
    segment: "Scale",
    ltvCacRatio: 6.3,
  },
  totalLtvAtRisk: 1200000,
  pipelineRiskExposure: 450000,
  accountsAboveRiskThreshold: 3,
  atRiskMilestones: 5,
  openHighRisks: 2,
  freshAccounts: 10,
  totalAccounts: 15,
});

assert.equal(brief.highlights.length, 4);
assert.equal(brief.highlights[0].label, "Unit economics");
assert.ok(brief.highlights[0].value.includes("4.2x"));
assert.equal(brief.decisions.length, 3);
assert.ok(brief.decisions[0].includes("Core"));
assert.ok(brief.coverage.includes("80%"));

console.log("executive brief unit tests passed");
