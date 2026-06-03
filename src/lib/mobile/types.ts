export type MobileCompanyStatus =
  | "currently holding"
  | "watching"
  | "unknown";

export type MobileMarket = {
  price?: string;
  dayChange?: string;
  marketCap?: string;
};

export type MobilePortfolioTotals = {
  totalEquity?: number;
  qtradeEquity?: number;
  openingEquity?: number;
  ytdChange?: number;
  ytdChangePercent?: number;
  weekChange?: number;
  weekChangePercent?: number;
};

export type MobilePortfolioHolding = {
  ticker: string;
  name: string;
  basket: string;
  primaryThesis: string;
  value: number;
  weight: number;
  openPnl: number;
  optionLegs: number;
};

export type MobilePortfolioExposure = {
  label: string;
  value: number;
  weight: number;
  companies: string[];
};

export type MobilePortfolioAccount = {
  label: string;
  value: number;
  weight: number;
};

export type MobilePortfolioActivity = {
  count?: number;
  tradeCount?: number;
  netCad?: number;
  netUsd?: number;
};

export type MobilePortfolioSignal = {
  title: string;
  path: string;
  linkedTickers: string[];
  modifiedAt: string;
  impactScore: number;
};

export type MobilePortfolioReport = {
  schemaVersion?: number;
  reportDate?: string;
  generatedAt?: string;
  sourcePath?: string;
  window?: {
    start?: string;
    end?: string;
  };
  totals?: MobilePortfolioTotals;
  holdings: MobilePortfolioHolding[];
  baskets: MobilePortfolioExposure[];
  theses: MobilePortfolioExposure[];
  accounts: MobilePortfolioAccount[];
  activity?: MobilePortfolioActivity;
  signals?: MobilePortfolioSignal[];
  dataNotes?: string[];
};

export type MobileCompany = {
  ticker: string;
  name: string;
  status: MobileCompanyStatus;
  assetType?: string;
  sector?: string;
  exchange?: string;
  companyProfilePath: string;
  companyThesisPath?: string;
  basket?: string;
  primaryThesis?: {
    label: string;
    path: string;
  };
  profileSummary?: {
    oneLiner?: string;
    whyItMatters?: string;
    financialSnapshot?: string;
    keyRisks?: string[];
  };
  thesisSections?: {
    coreThesis?: string;
    currentView?: string;
    dissentingView?: string;
    evidence?: string[];
    risks?: string[];
    investmentImplications?: string;
    whatWouldChangeMyMind?: string;
  };
  market?: MobileMarket;
  position?: MobilePortfolioHolding;
};

export type MobileBasket = {
  name: string;
  companyTickers: string[];
};

export type MobileThesis = {
  label: string;
  path: string;
  type?: string;
  status?: string;
  summary?: string;
  thesisPath?: string;
  companyTickers: string[];
};

export type DataIssue = {
  severity: "warning" | "error";
  filePath: string;
  ticker?: string;
  code: string;
  message: string;
  suggestedFix?: string;
};

export type MobilePortfolioSnapshot = {
  generatedAt: string;
  vaultPath?: string;
  portfolio?: MobilePortfolioReport;
  companies: MobileCompany[];
  baskets: MobileBasket[];
  theses: MobileThesis[];
  issues: DataIssue[];
};
