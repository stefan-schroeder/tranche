import type { NextRequest } from "next/server";
import { listSnapshots, seedSnapshotsIfEmpty } from "@/lib/db";
import { getConnector, loadNetWorthBreakdown } from "@/lib/connectors";
import { requireSession } from "@/lib/api-auth";

const RANGE_TO_DAYS: Record<string, number | undefined> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  ALL: undefined,
};

export async function GET(request: NextRequest) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  seedSnapshotsIfEmpty(await loadNetWorthBreakdown(getConnector()));

  const range = request.nextUrl.searchParams.get("range") ?? "30D";
  const sinceDays = range in RANGE_TO_DAYS ? RANGE_TO_DAYS[range] : 30;

  return Response.json(listSnapshots(sinceDays));
}
