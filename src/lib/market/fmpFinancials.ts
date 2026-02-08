type FmpIncomeStatement = {
  date: string;
  calendarYear?: string;
  period?: string;
  revenue?: number;
  grossProfit?: number;
  operatingIncome?: number;
  netIncome?: number;
};

type FmpCashFlowStatement = {
  date: string;
  calendarYear?: string;
  period?: string;
  operatingCashFlow?: number;
  capitalExpenditure?: number;
  freeCashFlow?: number;
};

type FmpBalanceSheet = {
  date: string;
  calendarYear?: string;
  period?: string;
  totalAssets?: number;
  totalLiabilities?: number;
  cashAndCashEquivalents?: number;
};

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
const DEFAULT_REVALIDATE = 6 * 60 * 60;

async function fetchFmp<T>(
  path: string,
  params: Record<string, string>,
  revalidate = DEFAULT_REVALIDATE
) {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return [] as T[];
  }

  const searchParams = new URLSearchParams({
    ...params,
    apikey: apiKey,
  });

  const response = await fetch(`${FMP_BASE_URL}/${path}?${searchParams.toString()}`, {
    next: { revalidate },
  });

  if (!response.ok) {
    return [] as T[];
  }

  return (await response.json()) as T[];
}

export async function getIncomeStatements(
  symbol: string,
  { limit = 5, period = "annual" } = {}
) {
  return fetchFmp<FmpIncomeStatement>("income-statement", {
    symbol: symbol.toUpperCase(),
    limit: String(limit),
    period,
  });
}

export async function getCashFlowStatements(
  symbol: string,
  { limit = 5, period = "annual" } = {}
) {
  return fetchFmp<FmpCashFlowStatement>("cash-flow-statement", {
    symbol: symbol.toUpperCase(),
    limit: String(limit),
    period,
  });
}

export async function getBalanceSheetStatements(
  symbol: string,
  { limit = 5, period = "annual" } = {}
) {
  return fetchFmp<FmpBalanceSheet>("balance-sheet-statement", {
    symbol: symbol.toUpperCase(),
    limit: String(limit),
    period,
  });
}

export function toYearLabel(value?: string) {
  if (!value) {
    return "";
  }

  return value.slice(0, 4);
}

export function formatCompactCurrency(value?: number | null) {
  if (value === undefined || value === null) {
    return "—";
  }

  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(0)}B`;
  }
  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatPercent(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return "—";
  }

  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function scaleSeries(values: number[], min = 12, max = 42) {
  if (!values.length) {
    return [] as number[];
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  if (maxValue === minValue) {
    return values.map(() => (min + max) / 2);
  }

  return values.map((value) => {
    const ratio = (value - minValue) / (maxValue - minValue);
    return Math.round(min + ratio * (max - min));
  });
}

export type FinancialSeries = {
  labels: string[];
  values: number[];
};

export function buildSeries(rows: { date: string; value: number }[]) {
  const labels = rows.map((row) => toYearLabel(row.date));
  const values = rows.map((row) => row.value);

  return { labels, values } satisfies FinancialSeries;
}
