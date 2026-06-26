import { createTranche, getTranchePositions, listTranches } from "@/lib/db";
import { calcContribution, trancheCurrentValue } from "@/lib/domain/tranches";
import type { Priority } from "@/lib/domain/types";
import { getConnector } from "@/lib/connectors";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const connector = getConnector();
  const tranches = listTranches();
  const now = new Date();

  // Read each tranche's positions once, then fetch all needed quotes in a single call.
  const trancheData = tranches.map((tranche) => ({
    tranche,
    rows: getTranchePositions(tranche.id),
  }));
  const tickers = [...new Set(trancheData.flatMap((d) => d.rows.map((r) => r.ticker)))];
  const [paycheck, quotes] = await Promise.all([
    connector.getPaycheck(),
    connector.getQuotes(tickers),
  ]);

  const result = trancheData.map(({ tranche, rows }) => {
    const positions = rows.map((p) => ({
      ticker: p.ticker,
      shares: p.shares,
      currentPrice: quotes[p.ticker] ?? 0,
    }));
    const currentValue = trancheCurrentValue(positions);
    const contribution = calcContribution(tranche, currentValue, paycheck.amount, paycheck.frequency, now);
    return { ...tranche, ...contribution, positions };
  });

  return Response.json(result);
}

interface CreateTrancheBody {
  name: string;
  goalAmount: number;
  targetDate: string;
  priority: Priority;
  color: string;
}

export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const body = (await request.json()) as Partial<CreateTrancheBody>;

  if (!body.name || typeof body.goalAmount !== "number" || !body.targetDate) {
    return Response.json({ error: "name, goalAmount, and targetDate are required" }, { status: 400 });
  }

  const tranche = createTranche({
    name: body.name,
    goalAmount: body.goalAmount,
    targetDate: body.targetDate,
    priority: body.priority ?? "medium",
    color: body.color ?? "#6366f1",
  });

  return Response.json(tranche, { status: 201 });
}
