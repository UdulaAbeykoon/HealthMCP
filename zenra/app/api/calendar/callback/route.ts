import { NextResponse } from "next/server";
import { exchangeCode } from "@/lib/integrations/calendar";
import { setTokens, consumeOAuthState, logActivity } from "@/lib/store";

export const runtime = "nodejs";

function redirect(req: Request, status: string) {
  const base = process.env.APP_BASE_URL || new URL(req.url).origin;
  return NextResponse.redirect(`${base}/integrations?calendar=${status}`);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return redirect(req, "error");
  if (!consumeOAuthState(state)) return redirect(req, "replay"); // single-use, replay rejected
  try {
    const tokens = await exchangeCode(code);
    setTokens("calendar", tokens);
    logActivity({ agent: "orchid", verb: "Connected", line: `Google Calendar linked${tokens.account ? ` · ${tokens.account}` : ""}`, state: "done" });
    return redirect(req, "connected");
  } catch {
    return redirect(req, "error");
  }
}
