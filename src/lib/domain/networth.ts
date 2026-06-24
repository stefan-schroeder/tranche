// Pure net-worth aggregation.
import type { NetWorthBreakdown } from "./types";

export interface NetWorthSummary extends NetWorthBreakdown {
  total: number;
  allocation: {
    cash: number; // 0..1 share of total
    investments: number;
    predictionMarkets: number;
  };
}

export function summarize(b: NetWorthBreakdown): NetWorthSummary {
  const total = b.cash + b.investments + b.predictionMarkets;
  const share = (n: number) => (total > 0 ? n / total : 0);
  return {
    ...b,
    total,
    allocation: {
      cash: share(b.cash),
      investments: share(b.investments),
      predictionMarkets: share(b.predictionMarkets),
    },
  };
}
