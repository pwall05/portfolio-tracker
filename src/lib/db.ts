import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const defaultPath = "./data/portfolio.db";

type ColumnSpec = {
  name: string;
  type: string;
};

export function getDbPath() {
  return process.env.DB_PATH ?? defaultPath;
}

export function openDb() {
  const resolvedPath = path.resolve(getDbPath());
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  const db = new Database(resolvedPath);
  db.pragma("journal_mode = WAL");
  return db;
}

function getExistingColumns(db: Database.Database, table: string) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return new Set(rows.map((row: { name: string }) => row.name));
}

function addMissingColumns(
  db: Database.Database,
  table: string,
  columns: ColumnSpec[]
) {
  const existing = getExistingColumns(db, table);
  for (const column of columns) {
    if (!existing.has(column.name)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column.name} ${column.type}`);
    }
  }
}

export function ensureSchema(db: Database.Database) {
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

  addMissingColumns(db, "balance_sheets", [
    { name: "total_current_assets", type: "REAL" },
    { name: "total_current_liabilities", type: "REAL" },
    { name: "total_debt", type: "REAL" },
    { name: "total_stockholders_equity", type: "REAL" },
  ]);
}
