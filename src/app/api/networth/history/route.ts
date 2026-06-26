import type { NextRequest } from "next/server";
import { listSnapshots, seedSnapshotsIfEmpty } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";

// TODO: replace with real connector data (see /api/networth). Mirrors those constants
// so seeded history ends at the same current breakdown.
const PLACEHOLDER_CASH = 18450; // Chase
const PLACEHOLDER_INVESTMENTS = 96320; // Schwab
const PLACEHOLDER_PREDICTION = 7240; // Kalshi + Polymarket

const RANGE_TO_DAYS: Record<string, number | undefined> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  ALL: undefined,
};

export async function GET(request: NextRequest) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  seedSnapshotsIfEmpty({
    cash: PLACEHOLDER_CASH,
    investments: PLACEHOLDER_INVESTMENTS,
    predictionMarkets: PLACEHOLDER_PREDICTION,
  });

  const range = request.nextUrl.searchParams.get("range") ?? "30D";
  const sinceDays = range in RANGE_TO_DAYS ? RANGE_TO_DAYS[range] : 30;

  return Response.json(listSnapshots(sinceDays));
}
