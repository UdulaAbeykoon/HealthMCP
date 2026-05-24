import { NextResponse } from "next/server";
import { backboardAvailable, listMemories, memoryChat, remember, seedHealthMemories } from "@/lib/backboard";
import { HEALTH } from "@/lib/health";
import { USER } from "@/lib/seed";

export const runtime = "nodejs";

function healthFacts(): string[] {
  const { latest, lifetime, profile } = HEALTH;
  return [
    `My name is ${USER.name} (${USER.fullName}).`,
    `I am ${profile.age} years old, ${profile.sex.toLowerCase()}.`,
    `My resting heart rate is around ${latest.restingHr} bpm and my HRV baseline is ${latest.hrvBaseline}ms.`,
    `My VO2 max is about ${latest.vo2max} and my SpO2 averages ${latest.spo2}%.`,
    `I have been tracking my health for ${lifetime.daysTracked} days since ${lifetime.firstDay}, with ${lifetime.totalWorkouts} logged workouts.`,
    `I care about protecting my energy for work, family, and life, and I prefer warm, low-pressure nudges.`,
  ];
}

export async function GET() {
  if (!backboardAvailable()) return NextResponse.json({ available: false, memories: [] });
  await seedHealthMemories(healthFacts());
  const memories = await listMemories();
  return NextResponse.json({ available: true, memories });
}

export async function POST(req: Request) {
  if (!backboardAvailable()) return NextResponse.json({ available: false }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as { action?: string; content?: string; fact?: string; threadId?: string };
  try {
    if (body.action === "remember" && body.fact) {
      await remember(body.fact);
      const memories = await listMemories();
      return NextResponse.json({ ok: true, memories });
    }
    if (body.action === "chat" && body.content) {
      const r = await memoryChat(body.content, body.threadId);
      return NextResponse.json({ ok: true, ...r });
    }
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 200 });
  }
}
