import type { CompanyThesis } from "./types";

const thesisMap: Record<string, CompanyThesis> = {
  AAPL: {
    symbol: "AAPL",
    snapshot: {
      positionSize: "14% of portfolio",
      costBasis: "$162.10",
      currentPrice: "$186.22",
    },
    keyQuestions: [
      "What keeps demand resilient?",
      "How fast is services growing?",
      "What changes the thesis?",
    ],
    highlights: [
      "Platform moat with services expansion",
      "Hardware refresh cycle stabilizing",
      "Capital return remains aggressive",
    ],
    status: {
      conviction: "High",
      riskLevel: "Medium",
      timeHorizon: "12-24 months",
    },
    nextActions: [
      "Update services revenue mix.",
      "Draft downside scenario.",
    ],
  },
  MSFT: {
    symbol: "MSFT",
    snapshot: {
      positionSize: "11% of portfolio",
      costBasis: "$352.40",
      currentPrice: "$412.08",
    },
    keyQuestions: [
      "Can AI attach boost ARPU?",
      "How sticky is Azure spend?",
      "What derails margin expansion?",
    ],
    highlights: [
      "Enterprise cloud moat deepening",
      "Copilot adoption gaining traction",
      "Capital allocation steady",
    ],
    status: {
      conviction: "High",
      riskLevel: "Low",
      timeHorizon: "12-24 months",
    },
    nextActions: [
      "Track Copilot attach rate.",
      "Review Azure growth comps.",
    ],
  },
  NVDA: {
    symbol: "NVDA",
    snapshot: {
      positionSize: "9% of portfolio",
      costBasis: "$512.90",
      currentPrice: "$621.44",
    },
    keyQuestions: [
      "Is demand still supply constrained?",
      "What does competitive pricing look like?",
      "How fast does software attach?",
    ],
    highlights: [
      "Data center demand stays elevated",
      "Software ecosystem expanding",
      "AI networking remains a tailwind",
    ],
    status: {
      conviction: "High",
      riskLevel: "Medium",
      timeHorizon: "6-18 months",
    },
    nextActions: [
      "Check hyperscaler capex plans.",
      "Update GPU lead-time notes.",
    ],
  },
};

const fallbackThesis: CompanyThesis = {
  symbol: "UNKNOWN",
  snapshot: {
    positionSize: "0% of portfolio",
    costBasis: "—",
    currentPrice: "—",
  },
  keyQuestions: [
    "What is the core thesis?",
    "Where is the edge?",
    "What would break this?",
  ],
  highlights: [
    "Add company-specific highlights.",
    "Link to portfolio exposure.",
    "Capture catalysts and risks.",
  ],
  status: {
    conviction: "Pending",
    riskLevel: "Pending",
    timeHorizon: "Pending",
  },
  nextActions: ["Add initial thesis notes."],
};

export function getCompanyThesis(symbol: string): CompanyThesis {
  const key = symbol.toUpperCase();
  return thesisMap[key] ?? { ...fallbackThesis, symbol: key };
}
