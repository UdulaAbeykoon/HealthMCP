import { NextResponse } from "next/server";
import { exchangeCode } from "@/lib/integrations/strava";
import { consumeOAuthState, logActivity } from "@/lib/store";

export const runtime = "nodejs";

function redirect(req: Request, status: string) {
  const base = process.env.APP_BASE_URL || new URL(req.url).origin;
  return NextResponse.redirect(`${base}/integrations?strava=${status}`);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return redirect(req, "error");
  if (!consumeOAuthState(state)) return redirect(req, "replay");
  try {
    await exchangeCode(code);
    logActivity({ agent: "atlas", verb: "Connected", line: "Strava linked", state: "done" });
    return redirect(req, "connected");
  } catch {
    return redirect(req, "error");
  }
}
