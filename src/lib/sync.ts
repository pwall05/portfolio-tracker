import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import { holdings } from "@/lib/data";

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
const DEFAULT_LIMIT = 5;

function getApiKey() {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    throw new Error("FMP_API_KEY is not set in the environment.");
  }
  return apiKey;
}

async function fetchFmp(pathSegment: string, params: Record<string, string>) {
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

function openDb() {
  const dbPath = process.env.DB_PATH ?? "./data/portfolio.db";
  const resolvedPath = path.resolve(dbPath);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  const db = new Database(resolvedPath);
  db.pragma("journal_mode = WAL");
  return db;
}

function ensureSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL UNIQUE,
      name TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS income_statements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      date TEXT NOT NULL,
      calendar_year TEXT,
      period TEXT,
      revenue REAL,
      gross_profit REAL,
      operating_income REAL,
      net_income REAL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(symbol, date, period),
      FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cash_flow_statements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      date TEXT NOT NULL,
      calendar_year TEXT,
      period TEXT,
      operating_cash_flow REAL,
      capital_expenditure REAL,
      free_cash_flow REAL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(symbol, date, period),
      FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS balance_sheets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      date TEXT NOT NULL,
      calendar_year TEXT,
      period TEXT,
      total_assets REAL,
      total_liabilities REAL,
      cash_and_cash_equivalents REAL,
      total_current_assets REAL,
      total_current_liabilities REAL,
      total_debt REAL,
      total_stockholders_equity REAL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(symbol, date, period),
      FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      synced_at TEXT NOT NULL,
      symbols TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_income_symbol_date
      ON income_statements(symbol, date);

    CREATE INDEX IF NOT EXISTS idx_cash_symbol_date
      ON cash_flow_statements(symbol, date);

    CREATE INDEX IF NOT EXISTS idx_balance_symbol_date
      ON balance_sheets(symbol, date);

    CREATE INDEX IF NOT EXISTS idx_sync_logs_synced_at
      ON sync_logs(synced_at);
  `);
}

function upsertCompany(db: Database.Database, symbol: string, name: string | null = null) {
  const insert = db.prepare(
    `INSERT INTO companies (symbol, name) VALUES (?, ?)
     ON CONFLICT(symbol) DO UPDATE SET name = COALESCE(excluded.name, companies.name), updated_at = datetime('now')`
  );
  insert.run(symbol, name);

  const row = db
    .prepare("SELECT id FROM companies WHERE symbol = ?")
    .get(symbol) as { id?: number } | undefined;
  return row?.id;
}

function upsertIncomeStatement(
  db: Database.Database,
  companyId: number,
  symbol: string,
  row: any
) {
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

function upsertCashFlowStatement(
  db: Database.Database,
  companyId: number,
  symbol: string,
  row: any
) {
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

function upsertBalanceSheet(
  db: Database.Database,
  companyId: number,
  symbol: string,
  row: any
) {
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

function insertSyncLog(
  db: Database.Database,
  symbols: string[],
  status: "success" | "error",
  message?: string
) {
  const stmt = db.prepare(
    `INSERT INTO sync_logs (synced_at, symbols, status, message)
     VALUES (?, ?, ?, ?)`
  );
  stmt.run(new Date().toISOString(), symbols.join(","), status, message ?? null);
}

export async function syncFinancials(symbols = holdings.map((h) => h.symbol)) {
  const db = openDb();
  ensureSchema(db);

  const results: Record<string, { income: number; cash: number; balance: number }> = {};

  try {
    for (const symbol of symbols) {
      const upper = symbol.toUpperCase();
      const companyId = upsertCompany(db, upper);
      if (!companyId) {
        continue;
      }

      const [incomeRows, cashRows, balanceRows] = await Promise.all([
        fetchFmp("income-statement", {
          symbol: upper,
          limit: String(DEFAULT_LIMIT),
          period: "annual",
        }),
        fetchFmp("cash-flow-statement", {
          symbol: upper,
          limit: String(DEFAULT_LIMIT),
          period: "annual",
        }),
        fetchFmp("balance-sheet-statement", {
          symbol: upper,
          limit: String(DEFAULT_LIMIT),
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

      results[upper] = {
        income: incomeRows.length,
        cash: cashRows.length,
        balance: balanceRows.length,
      };
    }

    insertSyncLog(db, symbols, "success");
  } catch (error) {
    insertSyncLog(
      db,
      symbols,
      "error",
      error instanceof Error ? error.message : "Sync failed"
    );
    throw error;
  } finally {
    db.close();
  }

  return {
    symbols,
    results,
    syncedAt: new Date().toISOString(),
  };
}
