// Creds-free connector returning fixed mock balances — these are the values that
// used to live as scattered placeholder constants across the API routes. Swap this
// for a live connector (see index.ts) once real Plaid/Schwab/Kalshi/Polymarket
// clients exist; no route changes required.
import type { PayFrequency } from "@/lib/domain/types";
import type { Connector } from "./types";

const CASH = 18450; // Chase via Plaid
const INVESTMENTS = 96320; // Schwab
const KALSHI = 4200; // Kalshi prediction markets
const POLYMARKET = 3040; // Polymarket prediction markets (KALSHI + POLYMARKET = 7240)
const DEFAULT_PRICE = 100; // flat per-share price until live Schwab quotes land
const PAYCHECK: { amount: number; frequency: PayFrequency } = {
  amount: 2000,
  frequency: "biweekly",
};

export class MockConnector implements Connector {
  async getCash(): Promise<number> {
    return CASH;
  }

  async getInvestments(): Promise<number> {
    return INVESTMENTS;
  }

  async getPredictionMarkets(): Promise<number> {
    return KALSHI + POLYMARKET;
  }

  async getQuotes(tickers: string[]): Promise<Record<string, number>> {
    return Object.fromEntries(tickers.map((ticker) => [ticker, DEFAULT_PRICE]));
  }

  async getPaycheck(): Promise<{ amount: number; frequency: PayFrequency }> {
    return PAYCHECK;
  }
}
