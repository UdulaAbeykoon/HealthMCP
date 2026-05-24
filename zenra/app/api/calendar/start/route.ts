import { NextResponse } from "next/server";
import { authUrl, calendarConfigured } from "@/lib/integrations/calendar";
import { newOAuthState } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  if (!calendarConfigured()) {
    return NextResponse.json({ mode: "needs_setup", error: "Google client not configured" }, { status: 400 });
  }
  const state = newOAuthState();
  return NextResponse.json({ mode: "live_ready", url: authUrl(state), state });
}
