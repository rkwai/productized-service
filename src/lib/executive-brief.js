const formatNumber = (value) => (Number.isFinite(value) ? Number(value).toLocaleString() : "—");
const formatMoney = (value) => (Number.isFinite(value) ? `$${formatNumber(value)}` : "—");
const formatRatio = (value) => (Number.isFinite(value) ? `${value}x` : "—");
const formatSignedPercent = (value) => {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
};

export const buildExecutiveBrief = ({
  portfolioLtvCacRatio,
  avgCacPaybackMonths,
  roiCoveragePct,
  mostProfitableSegment,
  bestRoiSegment,
  totalLtvAtRisk,
  pipelineRiskExposure,
  accountsAboveRiskThreshold,
  atRiskMilestones,
  openHighRisks,
  freshAccounts,
  totalAccounts,
}) => {
  const coverageValue = Number.isFinite(roiCoveragePct) ? `${roiCoveragePct}%` : "—";
  const paybackValue = Number.isFinite(avgCacPaybackMonths) ? `${avgCacPaybackMonths} mo` : "—";
  const profitShareValue = mostProfitableSegment?.profitShare ?? "—";
  const spendDeltaValue = formatSignedPercent(mostProfitableSegment?.spendDelta);

  const highlights = [
    {
      label: "Unit economics",
      value: Number.isFinite(portfolioLtvCacRatio)
        ? `${portfolioLtvCacRatio}x LTV:CAC`
        : "Add CAC + margin data",
      helper: Number.isFinite(portfolioLtvCacRatio)
        ? `Avg CAC payback ${paybackValue} · ROI coverage ${coverageValue}`
        : "Complete revenue inputs to unlock ROI coverage",
    },
    {
      label: "Profit concentration",
      value: mostProfitableSegment
        ? `${mostProfitableSegment.segment} (${profitShareValue}% profit share)`
        : "Profit leader pending",
      helper: mostProfitableSegment
        ? `LTV:CAC ${formatRatio(mostProfitableSegment.ltvCacRatio)}`
        : "Add CAC + margin data",
    },
    {
      label: "Retention exposure",
      value: Number.isFinite(totalLtvAtRisk)
        ? `${formatMoney(totalLtvAtRisk)} LTV at risk`
        : "LTV at risk pending",
      helper: Number.isFinite(pipelineRiskExposure)
        ? `Pipeline exposure ${formatMoney(pipelineRiskExposure)} across ${accountsAboveRiskThreshold ?? 0} customers`
        : "Pipeline exposure pending",
    },
    {
      label: "Activation exposure",
      value: Number.isFinite(atRiskMilestones)
        ? `${atRiskMilestones} milestones at risk`
        : "Milestone risk pending",
      helper: Number.isFinite(openHighRisks)
        ? `${openHighRisks} high severity risks open`
        : "Risk register pending",
    },
  ];

  const decisions = [];
  if (mostProfitableSegment) {
    const roiLeaderNote =
      bestRoiSegment && bestRoiSegment.segment && bestRoiSegment.segment !== mostProfitableSegment.segment
        ? ` ROI leader: ${bestRoiSegment.segment} (${formatRatio(bestRoiSegment.ltvCacRatio)}).`
        : "";
    decisions.push(
      `Shift spend toward ${mostProfitableSegment.segment} (${profitShareValue}% profit share, ${spendDeltaValue} spend delta).${roiLeaderNote}`
    );
  } else {
    decisions.push("Complete CAC + margin data to unlock segment spend recommendations.");
  }

  if (Number.isFinite(accountsAboveRiskThreshold) && accountsAboveRiskThreshold > 0) {
    decisions.push(
      `Sponsor retention recovery for ${accountsAboveRiskThreshold} customers with ${formatMoney(pipelineRiskExposure)} exposure.`
    );
  } else {
    decisions.push("No customers above retention risk threshold; keep a weekly watchlist.");
  }

  if ((atRiskMilestones ?? 0) > 0 || (openHighRisks ?? 0) > 0) {
    decisions.push(
      `Unblock ${atRiskMilestones ?? 0} at-risk milestones and ${openHighRisks ?? 0} high-severity risks.`
    );
  } else {
    decisions.push("Activation on track; maintain milestone reliability cadence.");
  }

  const freshnessValue =
    Number.isFinite(freshAccounts) && Number.isFinite(totalAccounts) && totalAccounts > 0
      ? `${freshAccounts}/${totalAccounts} updated <30d`
      : "Freshness pending";

  const coverage = `ROI coverage ${coverageValue} of customers · Data freshness ${freshnessValue}.`;

  return {
    highlights,
    decisions,
    coverage,
  };
};
