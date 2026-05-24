import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    proposals: store.proposals,
    reasoning: store.reasoning,
    activity: store.activity,
  });
}
