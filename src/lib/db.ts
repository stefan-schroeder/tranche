import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import type { Fund, Priority } from "./domain/types";

const DB_PATH = path.join(process.cwd(), "tranche.db");

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  db = new DatabaseSync(DB_PATH);
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

    CREATE TABLE IF NOT EXISTS funds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      goal_amount REAL NOT NULL,
      target_date DATE NOT NULL,
      priority TEXT CHECK(priority IN ('high','medium','low')) DEFAULT 'medium',
      color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fund_positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_id INTEGER REFERENCES funds(id) ON DELETE CASCADE,
      ticker TEXT NOT NULL,
      shares REAL NOT NULL,
      UNIQUE(fund_id, ticker)
    );
  `);
  return db;
}

interface FundRow {
  id: number;
  name: string;
  goal_amount: number;
  target_date: string;
  priority: Priority;
  color: string;
}

function rowToFund(row: FundRow): Fund {
  return {
    id: row.id,
    name: row.name,
    goalAmount: row.goal_amount,
    targetDate: row.target_date,
    priority: row.priority,
    color: row.color,
  };
}

export function listFunds(): Fund[] {
  const rows = getDb().prepare("SELECT * FROM funds ORDER BY created_at ASC").all() as unknown as FundRow[];
  return rows.map(rowToFund);
}

export function getFund(id: number): Fund | null {
  const row = getDb().prepare("SELECT * FROM funds WHERE id = ?").get(id) as unknown as FundRow | undefined;
  return row ? rowToFund(row) : null;
}

export interface NewFund {
  name: string;
  goalAmount: number;
  targetDate: string;
  priority: Priority;
  color: string;
}

export function createFund(input: NewFund): Fund {
  const result = getDb()
    .prepare(
      "INSERT INTO funds (name, goal_amount, target_date, priority, color) VALUES (?, ?, ?, ?, ?)",
    )
    .run(input.name, input.goalAmount, input.targetDate, input.priority, input.color);
  return getFund(Number(result.lastInsertRowid))!;
}

export function updateFund(id: number, input: Partial<NewFund>): Fund | null {
  const existing = getFund(id);
  if (!existing) return null;
  const merged = { ...existing, ...input, goalAmount: input.goalAmount ?? existing.goalAmount, targetDate: input.targetDate ?? existing.targetDate };
  getDb()
    .prepare(
      "UPDATE funds SET name = ?, goal_amount = ?, target_date = ?, priority = ?, color = ? WHERE id = ?",
    )
    .run(merged.name, merged.goalAmount, merged.targetDate, merged.priority, merged.color, id);
  return getFund(id);
}

export function deleteFund(id: number): boolean {
  const result = getDb().prepare("DELETE FROM funds WHERE id = ?").run(id);
  return result.changes > 0;
}

export interface FundPositionRow {
  ticker: string;
  shares: number;
}

export function getFundPositions(fundId: number): FundPositionRow[] {
  return getDb()
    .prepare("SELECT ticker, shares FROM fund_positions WHERE fund_id = ?")
    .all(fundId) as unknown as FundPositionRow[];
}

export function tagPosition(fundId: number, ticker: string, shares: number): void {
  getDb()
    .prepare(
      "INSERT INTO fund_positions (fund_id, ticker, shares) VALUES (?, ?, ?) ON CONFLICT(fund_id, ticker) DO UPDATE SET shares = excluded.shares",
    )
    .run(fundId, ticker, shares);
}

export function untagPosition(fundId: number, ticker: string): void {
  getDb().prepare("DELETE FROM fund_positions WHERE fund_id = ? AND ticker = ?").run(fundId, ticker);
}
