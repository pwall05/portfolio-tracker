import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

dotenv.config({ path: ".env.local" });
dotenv.config();

const dbPath = process.env.DB_PATH ?? "./data/portfolio.db";
const resolvedPath = path.resolve(dbPath);
const dir = path.dirname(resolvedPath);

fs.mkdirSync(dir, { recursive: true });

const db = new Database(resolvedPath);

db.exec(`
  PRAGMA journal_mode = WAL;

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

const balanceColumns = new Set(
  db.prepare("PRAGMA table_info(balance_sheets)").all().map((row) => row.name)
);

const columnsToAdd = [
  "total_current_assets",
  "total_current_liabilities",
  "total_debt",
  "total_stockholders_equity",
];

for (const column of columnsToAdd) {
  if (!balanceColumns.has(column)) {
    db.exec(`ALTER TABLE balance_sheets ADD COLUMN ${column} REAL`);
  }
}

db.close();

console.log(`Database initialized at ${resolvedPath}`);
