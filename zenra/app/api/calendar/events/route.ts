import { NextResponse } from "next/server";
import { listUpcoming, calendarConnected } from "@/lib/integrations/calendar";

export const runtime = "nodejs";

export async function GET() {
  if (!calendarConnected()) return NextResponse.json({ connected: false, events: [] });
  try {
    const events = await listUpcoming(2);
    return NextResponse.json({ connected: true, events });
  } catch (e) {
    return NextResponse.json({ connected: true, events: [], error: e instanceof Error ? e.message : "error" });
  }
}
