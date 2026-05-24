import { synthesize, voiceAvailable } from "@/lib/voice";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!voiceAvailable()) {
    return new Response("voice unavailable", { status: 503 });
  }
  const { text } = (await req.json()) as { text: string };
  if (!text?.trim()) return new Response("no text", { status: 400 });
  try {
    const audio = await synthesize(text.slice(0, 2500));
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response(e instanceof Error ? e.message : "voice error", { status: 500 });
  }
}
