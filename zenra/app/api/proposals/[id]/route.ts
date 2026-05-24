import { NextResponse } from "next/server";
import { findProposal } from "@/lib/store";
import { executeProposal } from "@/lib/execute";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { action, toTime } = (await req.json()) as { action: string; toTime?: string };
  const p = findProposal(id);
  if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });

  switch (action) {
    case "accept": {
      const res = await executeProposal(p);
      p.status = res.ok ? "accepted" : "pending";
      p.result = res.result;
      if (res.externalId) p.externalId = res.externalId;
      return NextResponse.json({ proposal: p, exec: res });
    }
    case "dismiss":
      p.status = "dismissed";
      return NextResponse.json({ proposal: p });
    case "snooze":
      p.status = "snoozed";
      return NextResponse.json({ proposal: p });
    case "modify":
      if (toTime && p.payload) (p.payload as Record<string, unknown>).toTime = toTime;
      p.result = `Adjusted to ${toTime}.`;
      return NextResponse.json({ proposal: p });
    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
}
