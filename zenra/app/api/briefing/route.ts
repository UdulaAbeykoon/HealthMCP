import { NextResponse } from "next/server";
import { morningBriefing, geminiAvailable } from "@/lib/gemini";
import { USER, VITALS } from "@/lib/seed";
import { HEALTH } from "@/lib/health";

export const runtime = "nodejs";

function fallback() {
  const v = VITALS, h = HEALTH.latest;
  return `Good morning, ${USER.name}. Lyra clocked you at ${v.sleep.asleepLabel} of sleep at ${v.sleep.efficiency}% efficiency. Sage says recovery's strong at ${v.recovery.score} out of 100 — HRV is ${v.hrv.value} milliseconds against your ${v.hrv.baseline} baseline, with a calm ${v.restingHr} bpm resting heart rate, breathing at ${h.respiratory} per minute and blood oxygen at ${h.spo2}%. Atlas has you at ${v.steps.value.toLocaleString()} steps and a VO2 max around ${h.vo2max}. Everything's lined up — but work's coming up soon, so you'd better hurry up!`;
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
