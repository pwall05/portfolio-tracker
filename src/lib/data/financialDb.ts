import { openDb, ensureSchema } from "@/lib/db";

export type DbIncomeRow = {
  date: string;
  revenue: number | null;
  gross_profit: number | null;
  operating_income: number | null;
};

export type DbCashRow = {
  date: string;
  free_cash_flow: number | null;
};

export type DbBalanceRow = {
  date: string;
  total_assets: number | null;
  total_liabilities: number | null;
  cash_and_cash_equivalents: number | null;
  total_current_assets: number | null;
  total_current_liabilities: number | null;
  total_debt: number | null;
  total_stockholders_equity: number | null;
};

export type SyncLog = {
  synced_at: string;
  symbols: string;
  status: string;
  message?: string | null;
};

export function getLatestIngestionTimestamp() {
  const db = openDb();
  ensureSchema(db);

  try {
    const row = db
      .prepare(
        "SELECT MAX(updated_at) as updated_at FROM income_statements WHERE updated_at IS NOT NULL"
      )
      .get() as { updated_at?: string | null } | undefined;

    return row?.updated_at ?? null;
  } finally {
    db.close();
  }
}

export function getLatestSyncLog(): SyncLog | null {
  const db = openDb();
  ensureSchema(db);

  try {
    const row = db
      .prepare(
        "SELECT synced_at, symbols, status, message FROM sync_logs ORDER BY synced_at DESC LIMIT 1"
      )
      .get() as SyncLog | undefined;

    return row ?? null;
  } finally {
    db.close();
  }
}

export function getSyncLogs(limit = 5): SyncLog[] {
  const db = openDb();
  ensureSchema(db);

  try {
    return db
      .prepare(
        "SELECT synced_at, symbols, status, message FROM sync_logs ORDER BY synced_at DESC LIMIT ?"
      )
      .all(limit) as SyncLog[];
  } finally {
    db.close();
  }
}

export function getIncomeStatementsFromDb(symbol: string, limit = 5): DbIncomeRow[] {
  const db = openDb();
  ensureSchema(db);

  try {
    return db
      .prepare(
        `SELECT date, revenue, gross_profit, operating_income
         FROM income_statements
         WHERE symbol = ?
         ORDER BY date DESC
         LIMIT ?`
      )
      .all(symbol.toUpperCase(), limit) as DbIncomeRow[];
  } finally {
    db.close();
  }
}

export function getCashFlowStatementsFromDb(symbol: string, limit = 5): DbCashRow[] {
  const db = openDb();
  ensureSchema(db);

  try {
    return db
      .prepare(
        `SELECT date, free_cash_flow
         FROM cash_flow_statements
         WHERE symbol = ?
         ORDER BY date DESC
         LIMIT ?`
      )
      .all(symbol.toUpperCase(), limit) as DbCashRow[];
  } finally {
    db.close();
  }
}

export function getBalanceSheetsFromDb(symbol: string, limit = 5): DbBalanceRow[] {
  const db = openDb();
  ensureSchema(db);

  try {
    return db
      .prepare(
        `SELECT
            date,
            total_assets,
            total_liabilities,
            cash_and_cash_equivalents,
            total_current_assets,
            total_current_liabilities,
            total_debt,
            total_stockholders_equity
         FROM balance_sheets
         WHERE symbol = ?
         ORDER BY date DESC
         LIMIT ?`
      )
      .all(symbol.toUpperCase(), limit) as DbBalanceRow[];
  } finally {
    db.close();
  }
}
