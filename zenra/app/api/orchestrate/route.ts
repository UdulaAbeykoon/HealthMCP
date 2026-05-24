import { NextResponse } from "next/server";
import { orchestrateProposals, geminiAvailable } from "@/lib/gemini";
import { store } from "@/lib/store";
import { listUpcoming, calendarConnected } from "@/lib/integrations/calendar";
import type { Proposal, ActionKind, Bucket } from "@/lib/types";
import type { AgentId } from "@/lib/agents";

export const runtime = "nodejs";

const VALID_AGENTS: AgentId[] = ["sage","lyra","atlas","orchid","echo","fern","iris"];

export async function POST(req: Request) {
  const { focus } = (await req.json().catch(() => ({}))) as { focus?: string };
  if (!geminiAvailable()) {
    return NextResponse.json({ proposals: store.proposals, generated: 0 });
  }
  try {
    const calEvents = calendarConnected()
      ? (await listUpcoming(2)).filter((e) => !e.allDay).map((e) => ({ id: e.id, summary: e.summary, startLabel: e.startLabel, durationMin: e.durationMin }))
      : [];
    const gen = await orchestrateProposals(focus, calEvents);
    const fresh: Proposal[] = gen
      .filter((g) => VALID_AGENTS.includes(g.agent))
      .map((g, i) => ({
        id: `gen-${Date.now()}-${i}`,
        agent: g.agent,
        kind: (g.kind as ActionKind) ?? "note",
        bucket: (["now", "morning", "later"].includes(g.bucket) ? g.bucket : "morning") as Bucket,
        urgent: g.bucket === "now",
        time: "just now",
        title: g.title,
        why: g.why,
        signals: (g.signals ?? []).map((t) => ({ text: t })),
        approveLabel: g.approveLabel ?? "Approve",
        status: "pending",
        payload: {
          ...(g.eventId ? { eventId: g.eventId } : {}),
          ...(g.targetTime ? { toTime: g.targetTime, time: g.targetTime } : {}),
          ...(g.durationMin ? { durationMin: g.durationMin } : {}),
        },
      }));
    if (fresh.length) {
      // Put fresh huddle results at the top
      store.proposals = [...fresh, ...store.proposals.filter((p) => p.status !== "pending" || !p.id.startsWith("gen-"))];
    }
    return NextResponse.json({ proposals: store.proposals, generated: fresh.length });
  } catch (e) {
    return NextResponse.json({ proposals: store.proposals, generated: 0, error: e instanceof Error ? e.message : "error" });
  }
}
