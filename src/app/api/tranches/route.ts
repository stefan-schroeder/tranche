import { createTranche, getTranchePositions, listTranches } from "@/lib/db";
import { calcContribution, trancheCurrentValue } from "@/lib/domain/tranches";
import type { Priority } from "@/lib/domain/types";

// TODO: replace with real Plaid paycheck detection + Schwab live prices.
const PLACEHOLDER_PAYCHECK = 2000;
const PLACEHOLDER_FREQ = "biweekly" as const;
const PLACEHOLDER_PRICE = 100;

export async function GET() {
  const tranches = listTranches();
  const now = new Date();

  const result = tranches.map((tranche) => {
    const positions = getTranchePositions(tranche.id).map((p) => ({
      ticker: p.ticker,
      shares: p.shares,
      currentPrice: PLACEHOLDER_PRICE,
    }));
    const currentValue = trancheCurrentValue(positions);
    const contribution = calcContribution(tranche, currentValue, PLACEHOLDER_PAYCHECK, PLACEHOLDER_FREQ, now);
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
