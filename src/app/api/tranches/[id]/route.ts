import type { NextRequest } from "next/server";
import { deleteTranche, updateTranche } from "@/lib/db";
import type { Priority } from "@/lib/domain/types";

interface UpdateTrancheBody {
  name?: string;
  goalAmount?: number;
  targetDate?: string;
  priority?: Priority;
  color?: string;
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/tranches/[id]">) {
  const { id } = await ctx.params;
  const trancheId = Number(id);
  if (!Number.isInteger(trancheId)) {
    return Response.json({ error: "invalid tranche id" }, { status: 400 });
  }

  const body = (await request.json()) as UpdateTrancheBody;
  const tranche = updateTranche(trancheId, body);
  if (!tranche) {
    return Response.json({ error: "tranche not found" }, { status: 404 });
  }
  return Response.json(tranche);
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/tranches/[id]">) {
  const { id } = await ctx.params;
  const trancheId = Number(id);
  if (!Number.isInteger(trancheId)) {
    return Response.json({ error: "invalid tranche id" }, { status: 400 });
  }

  const deleted = deleteTranche(trancheId);
  if (!deleted) {
    return Response.json({ error: "tranche not found" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
