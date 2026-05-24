import { NextResponse } from "next/server";
import { chatReply, geminiAvailable } from "@/lib/gemini";
import type { AgentId } from "@/lib/agents";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages, agent } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    agent?: AgentId;
  };

  if (!geminiAvailable()) {
    return NextResponse.json({
      reply: "I'm running without my Gemini key right now, so I can't think out loud — but the team is still watching your signals. Add GEMINI_API_KEY to wake me up.",
    });
  }

  try {
    const reply = await chatReply(messages ?? [], agent);
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json(
      { reply: "Hmm, I lost my train of thought for a second. Try me again?", error: e instanceof Error ? e.message : "error" },
      { status: 200 }
    );
  }
}
