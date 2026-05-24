import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { calendarConfigured, calendarConnected } from "@/lib/integrations/calendar";
import { slackConfigured } from "@/lib/integrations/slack";
import { stravaConfigured } from "@/lib/integrations/strava";
import { geminiAvailable } from "@/lib/gemini";
import { voiceAvailable } from "@/lib/voice";
import { backboardAvailable } from "@/lib/backboard";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    calendar: {
      ...store.connections.calendar,
      connected: calendarConnected(),
      configured: calendarConfigured(),
    },
    slack: { ...store.connections.slack, configured: slackConfigured(), connected: store.connections.slack.connected || slackConfigured() },
    strava: { ...store.connections.strava, configured: stravaConfigured() },
    gemini: { available: geminiAvailable() },
    voice: { available: voiceAvailable() },
    memory: { available: backboardAvailable() },
  });
}
