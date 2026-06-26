// Connector layer — the seam between the app and external financial data sources.
// Unlike lib/domain (pure math), connectors will eventually perform real I/O
// (Plaid, Schwab, Kalshi, Polymarket), so every method is async-shaped now to keep
// the eventual live swap non-breaking. Connectors may import domain *types*; domain
// must never import connectors.
import type { PayFrequency } from "@/lib/domain/types";

// Cash balances — backed by Plaid (Chase) in production.
export interface CashSource {
  getCash(): Promise<number>;
}

// Brokerage investment value — backed by Schwab in production.
export interface InvestmentSource {
  getInvestments(): Promise<number>;
}

// Prediction-market balances — backed by Kalshi + Polymarket, summed to one number.
export interface PredictionMarketSource {
  getPredictionMarkets(): Promise<number>;
}

// Per-ticker current prices — backed by Schwab quotes in production.
export interface QuoteSource {
  // Maps each requested ticker to its current price.
  getQuotes(tickers: string[]): Promise<Record<string, number>>;
}

// Paycheck detection — backed by Plaid transaction analysis in production.
export interface IncomeSource {
  getPaycheck(): Promise<{ amount: number; frequency: PayFrequency }>;
}

// The full surface the API routes consume. A concrete connector (mock today, a
// composed live connector later) implements every capability.
export interface Connector
  extends CashSource,
    InvestmentSource,
    PredictionMarketSource,
    QuoteSource,
    IncomeSource {}
