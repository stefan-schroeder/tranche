import { seedSnapshotsIfEmpty } from "@/lib/db";
import { summarize } from "@/lib/domain/networth";
import type { NetWorthBreakdown } from "@/lib/domain/types";
import { requireSession } from "@/lib/api-auth";

// TODO: replace with real connector data — Chase (Plaid) cash, Schwab investments,
// and Kalshi + Polymarket prediction-market positions.
const PLACEHOLDER_CASH = 18450; // Chase
const PLACEHOLDER_INVESTMENTS = 96320; // Schwab
const PLACEHOLDER_PREDICTION = 7240; // Kalshi + Polymarket

export async function GET() {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const breakdown: NetWorthBreakdown = {
    cash: PLACEHOLDER_CASH,
    investments: PLACEHOLDER_INVESTMENTS,
    predictionMarkets: PLACEHOLDER_PREDICTION,
  };

  // Keep the seeded history consistent with the current breakdown (dev convenience).
  seedSnapshotsIfEmpty(breakdown);

  return Response.json({
    ...summarize(breakdown),
    lastUpdated: new Date().toISOString(),
  });
}
