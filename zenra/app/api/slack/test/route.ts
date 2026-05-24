import { NextResponse } from "next/server";
import { authTest, postMessage, slackConfigured } from "@/lib/integrations/slack";
import { logActivity } from "@/lib/store";

export const runtime = "nodejs";

// Verify the Slack bot token and optionally post a hello from Echo.
export async function POST() {
  if (!slackConfigured()) return NextResponse.json({ ok: false, detail: "SLACK_BOT_TOKEN not set" }, { status: 400 });
  const auth = await authTest();
  if (!auth.ok) return NextResponse.json(auth, { status: 200 });
  const post = await postMessage("👋 Echo here — Zenra is connected. I'll quietly hold non-urgent pings when you're in deep work.");
  logActivity({ agent: "echo", verb: "Connected", line: `Slack workspace ${auth.team ?? ""} linked`, state: "done" });
  return NextResponse.json({ ok: true, team: auth.team, posted: post.ok, detail: post.detail });
}
