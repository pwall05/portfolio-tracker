import type { CompanyRef, MindmapTheme } from "./types";

export const trends = [
  "AI infrastructure capex accelerating",
  "Semis cycle expected to stay strong",
  "Consumer hardware demand stabilizing",
];

export const focusCompanies: CompanyRef[] = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA" },
];

export const mindmap: MindmapTheme[] = [
  {
    theme: "Platform Moats",
    summary: "Durable ecosystems with pricing power.",
    subThemes: [
      {
        name: "Services Expansion",
        summary: "Recurring revenue flywheel.",
        companies: [
          { symbol: "AAPL", summary: "Services mix compounding." },
          { symbol: "MSFT", summary: "Cloud + enterprise lock-in." },
        ],
      },
      {
        name: "Hardware Upgrade Cycles",
        summary: "Device cadence drives cash flow.",
        companies: [{ symbol: "AAPL", summary: "iPhone refresh support." }],
      },
    ],
  },
  {
    theme: "AI Infrastructure",
    summary: "Compute demand reshaping capex.",
    subThemes: [
      {
        name: "Accelerated Compute",
        summary: "GPU scarcity stays elevated.",
        companies: [{ symbol: "NVDA", summary: "Pricing power persists." }],
      },
    ],
  },
];
