import {
  buildSeries,
  formatCompactCurrency,
  formatPercent,
  getBalanceSheetStatements,
  getCashFlowStatements,
  getFmpQuotes,
  getIncomeStatements,
  scaleSeries,
} from "@/lib/market";

import {
  getBalanceSheetsFromDb,
  getCashFlowStatementsFromDb,
  getIncomeStatementsFromDb,
  getLatestIngestionTimestamp,
  getLatestSyncLog,
  getSyncLogs,
} from "./financialDb";
import { getCompanyThesis } from "./company";
import { financialSnapshot, modelPipelineSteps, upcomingWork } from "./financial";
import { focusCompanies, mindmap, trends } from "./logic";
import {
  aggregates,
  alerts,
  holdings,
  insightCard,
  portfolioPulse,
  portfolioStats,
  positions,
  researchQueue,
  spotlight,
  transactions,
} from "./portfolio";

const BASE_SYMBOL = "AAPL";
const COMPARE_SYMBOL = "MSFT";

function calcPercentChange(current?: number | null, previous?: number | null) {
  if (!current || !previous) {
    return undefined;
  }
  return ((current - previous) / previous) * 100;
}

function calcOperatingMargin(
  operatingIncome?: number | null,
  revenue?: number | null
) {
  if (!operatingIncome || !revenue) {
    return undefined;
  }
  return (operatingIncome / revenue) * 100;
}

function calcMargin(value?: number | null, total?: number | null) {
  if (!value || !total) {
    return undefined;
  }
  return (value / total) * 100;
}

function calcMarginChange(current?: number, previous?: number) {
  if (current === undefined || previous === undefined) {
    return undefined;
  }
  return current - previous;
}

function calcRatio(value?: number | null, divisor?: number | null) {
  if (!value || !divisor) {
    return undefined;
  }
  return value / divisor;
}

function formatRatio(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(2)}x`;
}

export async function getPortfolioOverview() {
  const symbols = holdings.map((holding) => holding.symbol);
  const { quotes, formatMoney, formatDayChange } = await getFmpQuotes(symbols);

  const liveHoldings = holdings.map((holding) => {
    const quote = quotes.get(holding.symbol.toUpperCase());
    const price = quote?.price;
    const change = quote?.change;
    const percent = quote?.changesPercentage;

    return {
      ...holding,
      price: price !== undefined ? formatMoney(price) : holding.price,
      dayChange:
        formatDayChange(price, change, percent) ?? holding.dayChange,
    };
  });

  return {
    stats: portfolioStats,
    holdings: liveHoldings,
    transactions,
    aggregates,
    positions,
    insightCard,
    spotlight,
    alerts,
  };
}

export async function getLogicOverview() {
  return {
    trends,
    focusCompanies,
    mindmap,
    portfolioPulse,
    researchQueue,
  };
}

async function loadIncomeFromDb(symbol: string) {
  const rows = getIncomeStatementsFromDb(symbol, 5);
  return rows.length
    ? rows.map((row) => ({
        date: row.date,
        revenue: row.revenue ?? undefined,
        grossProfit: row.gross_profit ?? undefined,
        operatingIncome: row.operating_income ?? undefined,
      }))
    : [];
}

async function loadCashFromDb(symbol: string) {
  const rows = getCashFlowStatementsFromDb(symbol, 5);
  return rows.length
    ? rows.map((row) => ({
        date: row.date,
        freeCashFlow: row.free_cash_flow ?? undefined,
      }))
    : [];
}

async function loadBalanceFromDb(symbol: string) {
  const rows = getBalanceSheetsFromDb(symbol, 5);
  return rows.length
    ? rows.map((row) => ({
        date: row.date,
        totalAssets: row.total_assets ?? undefined,
        totalLiabilities: row.total_liabilities ?? undefined,
        cashAndCashEquivalents: row.cash_and_cash_equivalents ?? undefined,
        totalCurrentAssets: row.total_current_assets ?? undefined,
        totalCurrentLiabilities: row.total_current_liabilities ?? undefined,
        totalDebt: row.total_debt ?? undefined,
        totalStockholdersEquity: row.total_stockholders_equity ?? undefined,
      }))
    : [];
}

export async function getFinancialOverview() {
  const [dbBaseIncome, dbCompareIncome, dbBaseCash, dbBaseBalance] =
    await Promise.all([
      loadIncomeFromDb(BASE_SYMBOL),
      loadIncomeFromDb(COMPARE_SYMBOL),
      loadCashFromDb(BASE_SYMBOL),
      loadBalanceFromDb(BASE_SYMBOL),
    ]);

  const [apiBaseIncome, apiCompareIncome, apiBaseCash, apiBaseBalance] =
    await Promise.all([
      dbBaseIncome.length ? [] : getIncomeStatements(BASE_SYMBOL),
      dbCompareIncome.length ? [] : getIncomeStatements(COMPARE_SYMBOL),
      dbBaseCash.length ? [] : getCashFlowStatements(BASE_SYMBOL),
      dbBaseBalance.length ? [] : getBalanceSheetStatements(BASE_SYMBOL),
    ]);

  const baseIncome = dbBaseIncome.length ? dbBaseIncome : apiBaseIncome;
  const compareIncome = dbCompareIncome.length ? dbCompareIncome : apiCompareIncome;
  const baseCash = dbBaseCash.length ? dbBaseCash : apiBaseCash;
  const baseBalance = dbBaseBalance.length ? dbBaseBalance : apiBaseBalance;

  const baseIncomeSorted = [...baseIncome].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const compareIncomeSorted = [...compareIncome].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const baseCashSorted = [...baseCash].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const baseBalanceSorted = [...baseBalance].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const latestIncome = baseIncomeSorted[0];
  const previousIncome = baseIncomeSorted[1];
  const latestCash = baseCashSorted[0];
  const previousCash = baseCashSorted[1];
  const latestBalance = baseBalanceSorted[0];
  const previousBalance = baseBalanceSorted[1];

  const history = [
    {
      label: "Revenue (TTM)",
      value: formatCompactCurrency(latestIncome?.revenue),
    },
    {
      label: "Operating Margin",
      value: formatPercent(
        calcOperatingMargin(latestIncome?.operatingIncome, latestIncome?.revenue)
      ),
    },
    {
      label: "Free Cash Flow",
      value: formatCompactCurrency(latestCash?.freeCashFlow),
    },
  ];

  const netCash =
    latestBalance?.cashAndCashEquivalents !== undefined &&
    latestBalance?.totalDebt !== undefined
      ? latestBalance.cashAndCashEquivalents - latestBalance.totalDebt
      : undefined;

  const kpiRows = [
    {
      name: "Revenue",
      value: formatCompactCurrency(latestIncome?.revenue),
      trend: formatPercent(
        calcPercentChange(latestIncome?.revenue, previousIncome?.revenue)
      ),
    },
    {
      name: "Gross Margin",
      value: formatPercent(
        calcMargin(latestIncome?.grossProfit, latestIncome?.revenue)
      ),
      trend: formatPercent(
        calcMarginChange(
          calcMargin(latestIncome?.grossProfit, latestIncome?.revenue),
          calcMargin(previousIncome?.grossProfit, previousIncome?.revenue)
        )
      ),
    },
    {
      name: "Operating Income",
      value: formatCompactCurrency(latestIncome?.operatingIncome),
      trend: formatPercent(
        calcPercentChange(
          latestIncome?.operatingIncome,
          previousIncome?.operatingIncome
        )
      ),
    },
    {
      name: "Total Assets",
      value: formatCompactCurrency(latestBalance?.totalAssets),
      trend: formatPercent(
        calcPercentChange(
          latestBalance?.totalAssets,
          previousBalance?.totalAssets
        )
      ),
    },
    {
      name: "Net Cash",
      value: formatCompactCurrency(netCash),
      trend: "—",
    },
    {
      name: "Debt / Equity",
      value: formatRatio(
        calcRatio(
          latestBalance?.totalDebt,
          latestBalance?.totalStockholdersEquity
        )
      ),
      trend: "—",
    },
    {
      name: "Current Ratio",
      value: formatRatio(
        calcRatio(
          latestBalance?.totalCurrentAssets,
          latestBalance?.totalCurrentLiabilities
        )
      ),
      trend: "—",
    },
  ];

  const baseRevenueSeries = buildSeries(
    baseIncomeSorted
      .slice(0, 5)
      .reverse()
      .filter((row) => typeof row.revenue === "number")
      .map((row) => ({ date: row.date, value: row.revenue ?? 0 }))
  );

  const compareRevenueSeries = buildSeries(
    compareIncomeSorted
      .slice(0, 5)
      .reverse()
      .filter((row) => typeof row.revenue === "number")
      .map((row) => ({ date: row.date, value: row.revenue ?? 0 }))
  );

  const operatingMarginSeries = baseIncomeSorted
    .slice(0, 5)
    .reverse()
    .map((row) =>
      calcOperatingMargin(row.operatingIncome ?? null, row.revenue ?? null) ?? 0
    )
    .filter((value) => value !== 0);

  const freeCashFlowSeries = baseCashSorted
    .slice(0, 5)
    .reverse()
    .map((row) => row.freeCashFlow ?? 0)
    .filter((value) => value !== 0);

  const sparkline = scaleSeries(baseRevenueSeries.values);
  const compareSparkline = scaleSeries(compareRevenueSeries.values);
  const lastUpdated = getLatestIngestionTimestamp();
  const lastSync = getLatestSyncLog();
  const syncLogs = getSyncLogs(5);

  return {
    history,
    kpiRows,
    sparkline,
    compareSparkline,
    labels: baseRevenueSeries.labels,
    baseSymbol: BASE_SYMBOL,
    compareSymbol: COMPARE_SYMBOL,
    operatingMarginSeries,
    freeCashFlowSeries,
    lastUpdated,
    lastSync,
    syncLogs,
    modelPipelineSteps,
    financialSnapshot,
    upcomingWork,
  };
}

export async function getCompanyThesisData(symbol: string) {
  const thesis = getCompanyThesis(symbol);
  const { quotes, formatMoney } = await getFmpQuotes([symbol]);
  const quote = quotes.get(symbol.toUpperCase());

  if (!quote?.price) {
    return thesis;
  }

  return {
    ...thesis,
    snapshot: {
      ...thesis.snapshot,
      currentPrice: formatMoney(quote.price),
    },
  };
}
