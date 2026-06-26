import { seedSnapshotsIfEmpty } from "@/lib/db";
import { summarize } from "@/lib/domain/networth";
import { getConnector, loadNetWorthBreakdown } from "@/lib/connectors";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const breakdown = await loadNetWorthBreakdown(getConnector());

  // Keep the seeded history consistent with the current breakdown (dev convenience).
  seedSnapshotsIfEmpty(breakdown);

  return Response.json({
    ...summarize(breakdown),
    lastUpdated: new Date().toISOString(),
  });
}
