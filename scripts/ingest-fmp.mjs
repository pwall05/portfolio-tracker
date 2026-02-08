import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA"];

dotenv.config({ path: ".env.local" });
dotenv.config();

const dbPath = process.env.DB_PATH ?? "./data/portfolio.db";
const resolvedPath = path.resolve(dbPath);

function getApiKey() {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    throw new Error("FMP_API_KEY is not set in the environment.");
  }
  return apiKey;
}

async function fetchFmp(pathSegment, params) {
  const apiKey = getApiKey();
  const searchParams = new URLSearchParams({
    ...params,
    apikey: apiKey,
  });

  const response = await fetch(`${FMP_BASE_URL}/${pathSegment}?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`FMP request failed (${response.status}) for ${pathSegment}`);
  }
  return response.json();
}

function initDb() {
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  const db = new Database(resolvedPath);
  db.pragma("journal_mode = WAL");
  return db;
}

function upsertCompany(db, symbol, name = null) {
  const insert = db.prepare(
    `INSERT INTO companies (symbol, name) VALUES (?, ?)
     ON CONFLICT(symbol) DO UPDATE SET name = COALESCE(excluded.name, companies.name), updated_at = datetime('now')`
  );
  insert.run(symbol, name);

  const row = db.prepare("SELECT id FROM companies WHERE symbol = ?").get(symbol);
  return row?.id;
}

function upsertIncomeStatement(db, companyId, symbol, row) {
  const stmt = db.prepare(
    `INSERT INTO income_statements (
      company_id, symbol, date, calendar_year, period,
      revenue, gross_profit, operating_income, net_income
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(symbol, date, period) DO UPDATE SET
      calendar_year = excluded.calendar_year,
      revenue = excluded.revenue,
      gross_profit = excluded.gross_profit,
      operating_income = excluded.operating_income,
      net_income = excluded.net_income,
      updated_at = datetime('now')`
  );

  stmt.run(
    companyId,
    symbol,
    row.date,
    row.calendarYear ?? null,
    row.period ?? "annual",
    row.revenue ?? null,
    row.grossProfit ?? null,
    row.operatingIncome ?? null,
    row.netIncome ?? null
  );
}

function upsertCashFlowStatement(db, companyId, symbol, row) {
  const stmt = db.prepare(
    `INSERT INTO cash_flow_statements (
      company_id, symbol, date, calendar_year, period,
      operating_cash_flow, capital_expenditure, free_cash_flow
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(symbol, date, period) DO UPDATE SET
      calendar_year = excluded.calendar_year,
      operating_cash_flow = excluded.operating_cash_flow,
      capital_expenditure = excluded.capital_expenditure,
      free_cash_flow = excluded.free_cash_flow,
      updated_at = datetime('now')`
  );

  stmt.run(
    companyId,
    symbol,
    row.date,
    row.calendarYear ?? null,
    row.period ?? "annual",
    row.operatingCashFlow ?? null,
    row.capitalExpenditure ?? null,
    row.freeCashFlow ?? null
  );
}

function upsertBalanceSheet(db, companyId, symbol, row) {
  const stmt = db.prepare(
    `INSERT INTO balance_sheets (
      company_id, symbol, date, calendar_year, period,
      total_assets, total_liabilities, cash_and_cash_equivalents,
      total_current_assets, total_current_liabilities, total_debt, total_stockholders_equity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(symbol, date, period) DO UPDATE SET
      calendar_year = excluded.calendar_year,
      total_assets = excluded.total_assets,
      total_liabilities = excluded.total_liabilities,
      cash_and_cash_equivalents = excluded.cash_and_cash_equivalents,
      total_current_assets = excluded.total_current_assets,
      total_current_liabilities = excluded.total_current_liabilities,
      total_debt = excluded.total_debt,
      total_stockholders_equity = excluded.total_stockholders_equity,
      updated_at = datetime('now')`
  );

  stmt.run(
    companyId,
    symbol,
    row.date,
    row.calendarYear ?? null,
    row.period ?? "annual",
    row.totalAssets ?? null,
    row.totalLiabilities ?? null,
    row.cashAndCashEquivalents ?? null,
    row.totalCurrentAssets ?? null,
    row.totalCurrentLiabilities ?? null,
    row.totalDebt ?? null,
    row.totalStockholdersEquity ?? null
  );
}

async function ingestSymbol(db, symbol) {
  const upper = symbol.toUpperCase();
  const companyId = upsertCompany(db, upper);

  const [incomeRows, cashRows, balanceRows] = await Promise.all([
    fetchFmp("income-statement", { symbol: upper, limit: "5", period: "annual" }),
    fetchFmp("cash-flow-statement", { symbol: upper, limit: "5", period: "annual" }),
    fetchFmp("balance-sheet-statement", {
      symbol: upper,
      limit: "5",
      period: "annual",
    }),
  ]);

  db.transaction(() => {
    for (const row of incomeRows) {
      upsertIncomeStatement(db, companyId, upper, row);
    }

    for (const row of cashRows) {
      upsertCashFlowStatement(db, companyId, upper, row);
    }

    for (const row of balanceRows) {
      upsertBalanceSheet(db, companyId, upper, row);
    }
  })();
}

async function main() {
  const symbols = process.argv.slice(2);
  const targets = symbols.length ? symbols : DEFAULT_SYMBOLS;
  const db = initDb();

  try {
    for (const symbol of targets) {
      await ingestSymbol(db, symbol);
    }
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
