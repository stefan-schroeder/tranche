// Public entry for the connector layer. API routes import from here only.
import type { NetWorthBreakdown } from "@/lib/domain/types";
import type { Connector } from "./types";
import { MockConnector } from "./mock";

export type { Connector } from "./types";

let connector: Connector | null = null;

/**
 * The active connector. Single swap point: return a composed live connector
 * (PlaidClient + SchwabClient + KalshiClient + PolymarketClient) here once real
 * clients exist — every route keeps calling getConnector() unchanged.
 */
export function getConnector(): Connector {
  if (!connector) connector = new MockConnector();
  return connector;
}

/**
 * Compose the three balance sources into the domain NetWorthBreakdown shape.
 * Connector-level aggregation of I/O sources — the pure total/allocation math
 * stays in lib/domain/networth (summarize).
 */
export async function loadNetWorthBreakdown(c: Connector): Promise<NetWorthBreakdown> {
  const [cash, investments, predictionMarkets] = await Promise.all([
    c.getCash(),
    c.getInvestments(),
    c.getPredictionMarkets(),
  ]);
  return { cash, investments, predictionMarkets };
}
