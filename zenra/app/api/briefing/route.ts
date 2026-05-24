import { NextResponse } from "next/server";
import { morningBriefing, geminiAvailable } from "@/lib/gemini";
import { USER, VITALS } from "@/lib/seed";
import { listUpcoming, calendarConnected } from "@/lib/integrations/calendar";

export const runtime = "nodejs";

function fallback(next?: { summary: string; startLabel: string }) {
  const v = VITALS;
  const calLine = next
    ? `And don't forget — you've got "${next.summary}" at ${next.startLabel}, so you'd better hurry!`
    : `Your calendar's clear this morning, so the time is yours.`;
  return `Good morning, ${USER.name}. You got ${v.sleep.asleepLabel} of sleep at ${v.sleep.efficiency}% efficiency — nicely done. Here's your rundown: recovery is ${v.recovery.score} out of 100, HRV ${v.hrv.value} milliseconds against a ${v.hrv.baseline} baseline, resting heart rate ${v.restingHr} bpm, and ${v.steps.value.toLocaleString()} steps so far. ${calLine}`;
}

async function nextEvent() {
  if (!calendarConnected()) return undefined;
  try {
    const events = (await listUpcoming(1)).filter((e) => !e.allDay);
    const now = Date.now();
    const e = events.find((ev) => new Date(ev.start).getTime() >= now) ?? events[0];
    return e ? { summary: e.summary, startLabel: e.startLabel } : undefined;
  } catch {
    return undefined;
  }
}

export async function GET() {
  const next = await nextEvent();
  if (!geminiAvailable()) return NextResponse.json({ text: fallback(next) });
  try {
    const text = await morningBriefing(next);
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: fallback(next) });
  }
}
