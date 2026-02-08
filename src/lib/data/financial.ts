import type { FinancialHistoryItem, FinancialKpiRow } from "./types";

export const history: FinancialHistoryItem[] = [
  { label: "Revenue (TTM)", value: "$381B" },
  { label: "Operating Margin", value: "29%" },
  { label: "Free Cash Flow", value: "$99B" },
];

export const kpiRows: FinancialKpiRow[] = [
  { name: "Revenue", value: "$381B", trend: "+6.2%" },
  { name: "Gross Margin", value: "44.1%", trend: "+0.8%" },
  { name: "Operating Income", value: "$112B", trend: "+4.3%" },
  { name: "Free Cash Flow", value: "$99B", trend: "+5.1%" },
];

export const sparkline = [18, 22, 16, 24, 28, 26, 32, 30, 34, 38, 36, 42];
export const compareSparkline = [
  12, 18, 14, 20, 24, 22, 26, 24, 28, 32, 30, 35,
];

export const modelPipelineSteps = [
  "Historical statements import",
  "KPI normalization",
  "Scenario assumptions",
  "Projection engine",
];

export const financialSnapshot = [
  "Coverage: 12 holdings",
  "Last refresh: 2 days ago",
  "Data quality: high",
];

export const upcomingWork = [
  "Add free cash flow rollups.",
  "Build projection scenarios.",
];
