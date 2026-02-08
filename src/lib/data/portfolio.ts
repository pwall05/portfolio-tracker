import type {
  Aggregate,
  AlertItem,
  Holding,
  InsightCard,
  Position,
  StatItem,
  Transaction,
} from "./types";

export const portfolioStats: StatItem[] = [
  { label: "Portfolio Value", value: "$128,402" },
  { label: "Day Change", value: "+$1,240" },
  { label: "Holdings", value: "12" },
];

export const holdings: Holding[] = [
  {
    symbol: "AAPL",
    name: "Apple",
    shares: "18.4",
    price: "$186.22",
    dayChange: "+2.1% today",
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    shares: "9.2",
    price: "$412.08",
    dayChange: "+1.4% today",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    shares: "6.0",
    price: "$621.44",
    dayChange: "+3.8% today",
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    shares: "4.8",
    price: "$204.91",
    dayChange: "-0.6% today",
  },
];

export const transactions: Transaction[] = [
  {
    id: "tx-1",
    symbol: "AAPL",
    action: "Buy",
    quantity: "10",
    price: "$165.20",
    date: "2025-09-12",
  },
  {
    id: "tx-2",
    symbol: "AAPL",
    action: "Buy",
    quantity: "6",
    price: "$172.10",
    date: "2025-11-03",
  },
  {
    id: "tx-3",
    symbol: "AAPL",
    action: "Sell",
    quantity: "2",
    price: "$189.40",
    date: "2026-01-06",
  },
  {
    id: "tx-4",
    symbol: "MSFT",
    action: "Buy",
    quantity: "5",
    price: "$386.75",
    date: "2025-08-28",
  },
];

export const aggregates: Aggregate[] = [
  { label: "Position Size", value: "$24,380" },
  { label: "Avg Cost", value: "$168.42" },
  { label: "Unrealized", value: "+$3,112" },
  { label: "Realized", value: "+$428" },
];

export const positions: Position[] = [
  {
    symbol: "AAPL",
    shares: "14.0",
    avgCost: "$168.42",
    marketValue: "$2,607",
    unrealized: "+$252",
    realized: "+$428",
  },
  {
    symbol: "MSFT",
    shares: "5.0",
    avgCost: "$386.75",
    marketValue: "$2,060",
    unrealized: "+$126",
    realized: "—",
  },
  {
    symbol: "NVDA",
    shares: "6.0",
    avgCost: "$594.20",
    marketValue: "$3,728",
    unrealized: "+$163",
    realized: "—",
  },
];

export const insightCard: InsightCard = {
  title: "Today’s focus",
  items: [
    "Trim AAPL at $195 target.",
    "Watch NVDA guidance after earnings.",
    "Rebalance cash to 8% by Friday.",
  ],
};

export const spotlight = {
  symbol: "AAPL",
  name: "Apple",
  details: [
    "Moat strength: high",
    "Services growth: accelerating",
    "Next catalyst: Q2 earnings",
  ],
};

export const alerts: AlertItem[] = [
  { id: "alert-1", text: "MSFT crosses new 52w high." },
  { id: "alert-2", text: "TSLA volatility spike." },
];

export const portfolioPulse = [
  "Total value: $128,402",
  "Day change: +$1,240",
  "Cash position: 6.8%",
];

export const researchQueue = [
  "Refresh AAPL services TAM.",
  "Check NVDA channel checks.",
];
