import { NextResponse } from "next/server";
import { authUrl, stravaConfigured } from "@/lib/integrations/strava";
import { newOAuthState } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  if (!stravaConfigured()) {
    return NextResponse.json({ mode: "needs_setup" }, { status: 400 });
  }
  const state = newOAuthState();
  return NextResponse.json({ mode: "live_ready", url: authUrl(state), state });
}
