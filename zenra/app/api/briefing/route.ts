import { NextResponse } from "next/server";
import { morningBriefing, geminiAvailable } from "@/lib/gemini";
import { USER, VITALS } from "@/lib/seed";

export const runtime = "nodejs";

function fallback() {
  const v = VITALS;
  return `Good morning, ${USER.name}. You got ${v.sleep.asleepLabel} of sleep at ${v.sleep.efficiency}% efficiency — nicely done. Here's your rundown: recovery is ${v.recovery.score} out of 100, HRV ${v.hrv.value} milliseconds against a ${v.hrv.baseline} baseline, resting heart rate ${v.restingHr} bpm, and ${v.steps.value.toLocaleString()} steps so far. You've got to get to work soon at 9:00 — you'd better hurry!`;
}

export async function GET() {
  if (!geminiAvailable()) return NextResponse.json({ text: fallback() });
  try {
    const text = await morningBriefing();
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: fallback() });
  }
}
