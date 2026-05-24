// Backboard — persistent agent memory (https://backboard.io).
// Gives the Zenra team real long-term memory: facts, preferences, and feedback
// that persist across sessions and surface automatically in conversation.
const BASE = "https://app.backboard.io/api";
const KEY = process.env.BACKBOARD_API_KEY;
const ASSISTANT_ID = process.env.BACKBOARD_ASSISTANT_ID;
// Use a top-tier, capable model for memory reasoning (routed via Backboard/OpenRouter).
const LLM_PROVIDER = process.env.BACKBOARD_PROVIDER || "openrouter";
const MODEL = process.env.BACKBOARD_MODEL || "anthropic/claude-sonnet-4.5";

export function backboardAvailable() {
  return Boolean(KEY && ASSISTANT_ID);
}

function headers() {
  return { "X-API-Key": KEY as string, "Content-Type": "application/json" };
}

export interface Memory {
  memory_id?: string;
  id?: string;
  content?: string;
  memory?: string;
  text?: string;
  created_at?: string;
  [k: string]: unknown;
}

/** Send a message to the Zenra assistant with memory on. Returns reply + any recalled memories. */
export async function memoryChat(content: string, threadId?: string): Promise<{
  content: string; threadId?: string; recalled: string[];
}> {
  const res = await fetch(`${BASE}/threads/messages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ content, assistant_id: ASSISTANT_ID, thread_id: threadId, memory: "Auto", stream: false, llm_provider: LLM_PROVIDER, model_name: MODEL }),
  });
  if (!res.ok) throw new Error(`Backboard ${res.status}: ${await res.text()}`);
  const d = await res.json();
  const recalledRaw = d.retrieved_memories ?? [];
  const recalled: string[] = Array.isArray(recalledRaw)
    ? recalledRaw.map((m: Memory | string) => (typeof m === "string" ? m : m.content ?? m.memory ?? m.text ?? "")).filter(Boolean)
    : [];
  return { content: d.content ?? "", threadId: d.thread_id, recalled };
}

/** Store a fact/preference as a memory (the engine extracts it). */
export async function remember(fact: string): Promise<boolean> {
  if (!backboardAvailable()) return false;
  try {
    await fetch(`${BASE}/threads/messages`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        content: `Please remember this about me for future sessions: ${fact}`,
        assistant_id: ASSISTANT_ID, memory: "Auto", stream: false,
        llm_provider: LLM_PROVIDER, model_name: MODEL,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

/** List everything Zenra currently remembers about the user. */
export async function listMemories(): Promise<{ content: string; createdAt?: string }[]> {
  if (!backboardAvailable()) return [];
  const res = await fetch(`${BASE}/assistants/${ASSISTANT_ID}/memories`, { headers: headers() });
  if (!res.ok) return [];
  const d = await res.json();
  const arr: Memory[] = d.memories ?? d.items ?? (Array.isArray(d) ? d : []);
  return arr
    .map((m) => ({ content: (m.content ?? m.memory ?? m.text ?? "").toString(), createdAt: m.created_at }))
    .filter((m) => m.content);
}

/** Seed the user's real health baselines/profile as memories (idempotent-ish). */
export async function seedHealthMemories(facts: string[]): Promise<number> {
  if (!backboardAvailable()) return 0;
  const existing = await listMemories();
  if (existing.length >= 3) return existing.length; // already seeded
  await remember(facts.join(" "));
  return facts.length;
}
