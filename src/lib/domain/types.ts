// Pure domain types — plain data shapes only.
// RULE: files in lib/domain may ONLY import from other lib/domain files.
// No DB rows, no network types, no Next.js, no process.env, no clock access.
// This is what makes the math trivially testable and portable.

export type Priority = "high" | "medium" | "low";

export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

export interface Fund {
  id: number;
  name: string;
  goalAmount: number;
  targetDate: string; // ISO date "YYYY-MM-DD"
  priority: Priority;
  color: string;
}

// A holding tagged to a fund, joined with its current market price.
export interface TaggedPosition {
  ticker: string;
  shares: number;
  currentPrice: number;
}

// One account's contribution to net worth.
export interface NetWorthBreakdown {
  cash: number;
  investments: number;
  predictionMarkets: number;
}
