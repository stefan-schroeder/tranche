import type { NextRequest } from "next/server";
import { deleteFund, updateFund } from "@/lib/db";
import type { Priority } from "@/lib/domain/types";

interface UpdateFundBody {
  name?: string;
  goalAmount?: number;
  targetDate?: string;
  priority?: Priority;
  color?: string;
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/funds/[id]">) {
  const { id } = await ctx.params;
  const fundId = Number(id);
  if (!Number.isInteger(fundId)) {
    return Response.json({ error: "invalid fund id" }, { status: 400 });
  }

  const body = (await request.json()) as UpdateFundBody;
  const fund = updateFund(fundId, body);
  if (!fund) {
    return Response.json({ error: "fund not found" }, { status: 404 });
  }
  return Response.json(fund);
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/funds/[id]">) {
  const { id } = await ctx.params;
  const fundId = Number(id);
  if (!Number.isInteger(fundId)) {
    return Response.json({ error: "invalid fund id" }, { status: 400 });
  }

  const deleted = deleteFund(fundId);
  if (!deleted) {
    return Response.json({ error: "fund not found" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
