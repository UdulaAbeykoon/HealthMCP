import { GoogleGenerativeAI } from "@google/generative-ai";
import { AGENTS, AGENT_LIST, type AgentId } from "./agents";
import { VITALS, USER } from "./seed";

const apiKey = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export function geminiAvailable() {
  return Boolean(apiKey);
}

function client() {
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenerativeAI(apiKey);
}

// Shared context the whole team can reason over.
export const TEAM_CONTEXT = `
You are part of Zenra — an invisible team of AI agents that protects ${USER.name}'s energy
so they can actually show up for work, family, and life instead of burning out.

Today's signals (imported from ${USER.name}'s wearables):
- Sleep: ${VITALS.sleep.asleepLabel} asleep, efficiency ${VITALS.sleep.efficiency}% (lighter than usual)
- Recovery score: ${VITALS.recovery.score}/100 (${VITALS.recovery.label})
- HRV: ${VITALS.hrv.value}ms vs ${VITALS.hrv.baseline}ms baseline, trending down over 3 nights
- Resting HR: ${VITALS.restingHr} bpm
- Steps: ${VITALS.steps.value.toLocaleString()} (${VITALS.steps.goalPct}% of goal)
- A workout is planned for 16:00 and there is a 09:00 internal team sync.

The team coordinates across the user's Calendar and Slack to protect family dinners,
focus blocks, workouts, and high-workload periods.

The seven agents:
${AGENT_LIST.map((a) => `- ${a.name} (${a.role}): ${a.blurb}`).join("\n")}
`.trim();

const STYLE = `
Tone: warm, encouraging, human, and a little witty — never clinical, never preachy, never alarmist.
Keep replies short (2-4 sentences). Talk like a trusted friend who happens to have your back.
Tie health to real life: family, work, rest, showing up. Never give medical diagnosis; this is not medical advice.
Refer to other agents by name when they'd be involved ("Orchid can move that meeting...").
Do not use markdown headers or bullet lists unless the user asks for a list.
`.trim();

/** A single agent (or the orb, default Sage-led) replies in character. */
export async function chatReply(
  messages: { role: "user" | "assistant"; content: string }[],
  agentId?: AgentId
): Promise<string> {
  const agent = agentId ? AGENTS[agentId] : null;
  const persona = agent
    ? `You are speaking as ${agent.name}, the ${agent.role} agent. ${agent.persona}`
    : `You are Zenra speaking with one warm voice on behalf of the whole team. Lean on the relevant agent's expertise and name them.`;

  const sys = `${TEAM_CONTEXT}\n\n${persona}\n\n${STYLE}`;
  const model = client().getGenerativeModel({ model: MODEL, systemInstruction: sys });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const last = messages[messages.length - 1];

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(last.content);
  return result.response.text().trim();
}

export interface GeneratedProposal {
  agent: AgentId;
  kind: string;
  bucket: "now" | "morning" | "later";
  title: string;
  why: string;
  signals: string[];
  approveLabel: string;
  eventId?: string;     // a real calendar event to act on
  targetTime?: string;  // "HH:MM" for moves/holds
  durationMin?: number;
}

export interface CalendarContextEvent { id: string; summary: string; startLabel: string; durationMin: number; }

/** Ask the team to "huddle" and produce fresh, coordinated proposals as JSON, grounded in the real calendar. */
export async function orchestrateProposals(focus?: string, events: CalendarContextEvent[] = []): Promise<GeneratedProposal[]> {
  const sys = `${TEAM_CONTEXT}\n\nYou are the Conductor that coordinates the team's morning huddle.`;
  const model = client().getGenerativeModel({
    model: MODEL,
    systemInstruction: sys,
    generationConfig: { responseMimeType: "application/json" },
  });

  const calBlock = events.length
    ? `Here is ${USER.name}'s REAL calendar for today/tomorrow (use these exact eventIds and times when proposing calendar actions):\n${events.map((e) => `- [${e.id}] "${e.summary}" at ${e.startLabel} (${e.durationMin}min)`).join("\n")}`
    : `No live calendar events were available — propose calendar holds at sensible clock times instead.`;

  const prompt = `
${calBlock}

Based on today's signals${focus ? ` and this focus: "${focus}"` : ""}, produce 3-5 coordinated proposals
from the team that protect ${USER.name}'s energy and real life today. At least one proposal should act on a REAL
calendar event above (move it to a better time, or create a protective hold around it). Each proposal must come from
the agent whose role fits. Make them warm, specific, and a little witty.

Return ONLY a JSON array. Each item:
{
  "agent": one of "sage"|"lyra"|"atlas"|"orchid"|"echo"|"fern"|"iris",
  "kind": one of "calendar_move"|"calendar_create"|"calendar_delete"|"slack_dnd"|"slack_status"|"nutrition"|"movement"|"sleep"|"reflection"|"note",
  "bucket": "now"|"morning"|"later",
  "title": short first-person proposal addressed to the user (<= 110 chars),
  "why": 1-2 warm sentences explaining the reasoning,
  "signals": array of 2-3 short evidence strings,
  "approveLabel": short button label (<= 22 chars),
  "eventId": (only for calendar_move/calendar_delete) the exact id from the list above,
  "targetTime": (for calendar_move/calendar_create) a "HH:MM" 24h clock time,
  "durationMin": (for calendar_create) integer minutes
}
`.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : (parsed.proposals ?? []);
  } catch {
    return [];
  }
}

/** Morning briefing — the "wow" narration. Follows: greeting → sleep → vitals → get-to-work nudge. */
export async function morningBriefing(): Promise<string> {
  const sys = `${TEAM_CONTEXT}\n\nYou are Zenra delivering a spoken morning briefing in one warm voice.`;
  const model = client().getGenerativeModel({ model: MODEL, systemInstruction: sys });
  const prompt = `Deliver ${USER.name}'s spoken morning briefing. Follow this exact flow, nothing else:
1. Greet them warmly: start with "Good morning, ${USER.name}."
2. Tell them how they slept: they got ${VITALS.sleep.asleepLabel} of sleep at ${VITALS.sleep.efficiency}% efficiency.
3. Run quickly through today's vitals like a rundown: recovery ${VITALS.recovery.score} out of 100, HRV ${VITALS.hrv.value} milliseconds (baseline ${VITALS.hrv.baseline}), resting heart rate ${VITALS.restingHr} bpm, and ${VITALS.steps.value.toLocaleString()} steps so far.
4. End with EXACTLY this sentence, word for word: "You've got to get to work soon at 9:00 — you'd better hurry!"
Keep it warm, human, and a little witty — about 5 sentences, written to be spoken aloud. ${STYLE}`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
