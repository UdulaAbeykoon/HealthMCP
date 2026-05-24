import { NextResponse } from "next/server";
import { morningBriefing, geminiAvailable } from "@/lib/gemini";
import { USER } from "@/lib/seed";

export const runtime = "nodejs";

const FALLBACK = `Good morning, ${USER.name}. You slept a little light last night, so the team eased into the day for you. Sage flagged your recovery, Orchid nudged your 9 o'clock to 10:30 so you start sharp, and Echo is holding Slack until late morning. Atlas swapped today's session for something gentler. Nothing for you to do — just show up.`;

export async function GET() {
  if (!geminiAvailable()) return NextResponse.json({ text: FALLBACK });
  try {
    const text = await morningBriefing();
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: FALLBACK });
  }
}
