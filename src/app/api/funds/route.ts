import { createFund, getFundPositions, listFunds } from "@/lib/db";
import { calcContribution, fundCurrentValue } from "@/lib/domain/funds";
import type { Priority } from "@/lib/domain/types";

// TODO: replace with real Plaid paycheck detection + Schwab live prices.
const PLACEHOLDER_PAYCHECK = 2000;
const PLACEHOLDER_FREQ = "biweekly" as const;
const PLACEHOLDER_PRICE = 100;

export async function GET() {
  const funds = listFunds();
  const now = new Date();

  const result = funds.map((fund) => {
    const positions = getFundPositions(fund.id).map((p) => ({
      ticker: p.ticker,
      shares: p.shares,
      currentPrice: PLACEHOLDER_PRICE,
    }));
    const currentValue = fundCurrentValue(positions);
    const contribution = calcContribution(fund, currentValue, PLACEHOLDER_PAYCHECK, PLACEHOLDER_FREQ, now);
    return { ...fund, ...contribution, positions };
  });

  return Response.json(result);
}

interface CreateFundBody {
  name: string;
  goalAmount: number;
  targetDate: string;
  priority: Priority;
  color: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateFundBody>;

  if (!body.name || typeof body.goalAmount !== "number" || !body.targetDate) {
    return Response.json({ error: "name, goalAmount, and targetDate are required" }, { status: 400 });
  }

  const fund = createFund({
    name: body.name,
    goalAmount: body.goalAmount,
    targetDate: body.targetDate,
    priority: body.priority ?? "medium",
    color: body.color ?? "#6366f1",
  });

  return Response.json(fund, { status: 201 });
}
