export type StatItem = {
  label: string;
  value: string;
};

export type Holding = {
  symbol: string;
  name: string;
  shares: string;
  price: string;
  dayChange: string;
};

export type TransactionAction = "Buy" | "Sell";

export type Transaction = {
  id: string;
  symbol: string;
  action: TransactionAction;
  quantity: string;
  price: string;
  date: string;
};

export type Aggregate = {
  label: string;
  value: string;
};

export type Position = {
  symbol: string;
  shares: string;
  avgCost: string;
  marketValue: string;
  unrealized: string;
  realized: string;
};

export type CompanyRef = {
  symbol: string;
  name: string;
};

export type InsightCard = {
  title: string;
  items: string[];
};

export type AlertItem = {
  id: string;
  text: string;
};

export type MindmapCompany = {
  symbol: string;
  summary: string;
};

export type MindmapSubTheme = {
  name: string;
  summary: string;
  companies: MindmapCompany[];
};

export type MindmapTheme = {
  theme: string;
  summary: string;
  subThemes: MindmapSubTheme[];
};

export type FinancialHistoryItem = {
  label: string;
  value: string;
};

export type FinancialKpiRow = {
  name: string;
  value: string;
  trend: string;
};

export type CompanySnapshot = {
  positionSize: string;
  costBasis: string;
  currentPrice: string;
};

export type CompanyStatus = {
  conviction: string;
  riskLevel: string;
  timeHorizon: string;
};

export type CompanyThesis = {
  symbol: string;
  snapshot: CompanySnapshot;
  keyQuestions: string[];
  highlights: string[];
  status: CompanyStatus;
  nextActions: string[];
};
