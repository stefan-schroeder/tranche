import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import type { Tranche, Priority } from "./domain/types";

const DB_PATH = path.join(process.cwd(), "tranche.db");

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  db = new DatabaseSync(DB_PATH);
  migrateLegacyFundTables(db);
  db.exec(`
    CREATE TABLE IF NOT EXISTS plaid_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT UNIQUE NOT NULL,
      access_token TEXT NOT NULL,
      institution_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schwab_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS networth_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      cash REAL,
      investments REAL,
      prediction_markets REAL,
      snapshot_date DATE UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tranches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      goal_amount REAL NOT NULL,
      target_date DATE NOT NULL,
      priority TEXT CHECK(priority IN ('high','medium','low')) DEFAULT 'medium',
      color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tranche_positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tranche_id INTEGER REFERENCES tranches(id) ON DELETE CASCADE,
      ticker TEXT NOT NULL,
      shares REAL NOT NULL,
      UNIQUE(tranche_id, ticker)
    );
  `);
  return db;
}

// One-time migration: this table used to be called "funds" / "fund_positions"
// before the "tranche" terminology was adopted. Rename in place so existing
// local data survives instead of silently disappearing behind new empty tables.
function migrateLegacyFundTables(database: DatabaseSync): void {
  const hasLegacyFunds = database
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'funds'")
    .get();
  if (!hasLegacyFunds) return;

  database.exec(`
    ALTER TABLE funds RENAME TO tranches;
    ALTER TABLE fund_positions RENAME TO tranche_positions;
    ALTER TABLE tranche_positions RENAME COLUMN fund_id TO tranche_id;
  `);
}

interface TrancheRow {
  id: number;
  name: string;
  goal_amount: number;
  target_date: string;
  priority: Priority;
  color: string;
}

function rowToTranche(row: TrancheRow): Tranche {
  return {
    id: row.id,
    name: row.name,
    goalAmount: row.goal_amount,
    targetDate: row.target_date,
    priority: row.priority,
    color: row.color,
  };
}

export function listTranches(): Tranche[] {
  const rows = getDb().prepare("SELECT * FROM tranches ORDER BY created_at ASC").all() as unknown as TrancheRow[];
  return rows.map(rowToTranche);
}

export function getTranche(id: number): Tranche | null {
  const row = getDb().prepare("SELECT * FROM tranches WHERE id = ?").get(id) as unknown as TrancheRow | undefined;
  return row ? rowToTranche(row) : null;
}

export interface NewTranche {
  name: string;
  goalAmount: number;
  targetDate: string;
  priority: Priority;
  color: string;
}

export function createTranche(input: NewTranche): Tranche {
  const result = getDb()
    .prepare(
      "INSERT INTO tranches (name, goal_amount, target_date, priority, color) VALUES (?, ?, ?, ?, ?)",
    )
    .run(input.name, input.goalAmount, input.targetDate, input.priority, input.color);
  return getTranche(Number(result.lastInsertRowid))!;
}

export function updateTranche(id: number, input: Partial<NewTranche>): Tranche | null {
  const existing = getTranche(id);
  if (!existing) return null;
  const merged = { ...existing, ...input, goalAmount: input.goalAmount ?? existing.goalAmount, targetDate: input.targetDate ?? existing.targetDate };
  getDb()
    .prepare(
      "UPDATE tranches SET name = ?, goal_amount = ?, target_date = ?, priority = ?, color = ? WHERE id = ?",
    )
    .run(merged.name, merged.goalAmount, merged.targetDate, merged.priority, merged.color, id);
  return getTranche(id);
}

export function deleteTranche(id: number): boolean {
  const result = getDb().prepare("DELETE FROM tranches WHERE id = ?").run(id);
  return result.changes > 0;
}

export interface TranchePositionRow {
  ticker: string;
  shares: number;
}

export function getTranchePositions(trancheId: number): TranchePositionRow[] {
  return getDb()
    .prepare("SELECT ticker, shares FROM tranche_positions WHERE tranche_id = ?")
    .all(trancheId) as unknown as TranchePositionRow[];
}

export function tagPosition(trancheId: number, ticker: string, shares: number): void {
  getDb()
    .prepare(
      "INSERT INTO tranche_positions (tranche_id, ticker, shares) VALUES (?, ?, ?) ON CONFLICT(tranche_id, ticker) DO UPDATE SET shares = excluded.shares",
    )
    .run(trancheId, ticker, shares);
}

export function untagPosition(trancheId: number, ticker: string): void {
  getDb().prepare("DELETE FROM tranche_positions WHERE tranche_id = ? AND ticker = ?").run(trancheId, ticker);
}
