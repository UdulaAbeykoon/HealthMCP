import { AGENTS } from "./agents";
import type { Proposal } from "./types";
import { logActivity } from "./store";
import { createEvent, deleteEvent, calendarConnected, todayAt } from "./integrations/calendar";
import { setDnd, postMessage, slackConfigured } from "./integrations/slack";

export interface ExecResult {
  ok: boolean;
  result: string;
  externalId?: string;
  live: boolean;       // true if a real external action happened
}

/** Execute the real-world side-effect for an accepted proposal. */
export async function executeProposal(p: Proposal): Promise<ExecResult> {
  const agent = AGENTS[p.agent];
  try {
    switch (p.kind) {
      case "calendar_move": {
        const payload = (p.payload ?? {}) as { summary?: string; toTime?: string; durationMin?: number };
        const to = payload.toTime ?? "10:30";
        if (calendarConnected()) {
          const { startISO, endISO } = todayAt(to, payload.durationMin ?? 30);
          const id = await createEvent({
            summary: `${payload.summary ?? "Meeting"} (moved by Orchid)`,
            startISO, endISO,
            description: `Orchid moved this to protect your energy. ${p.why}`,
          });
          logActivity({ agent: p.agent, verb: "Moved", line: `${payload.summary ?? "Meeting"} → ${to} on your calendar`, state: "done" });
          return { ok: true, live: true, externalId: id ?? undefined, result: `Done — moved to ${to} and added to your Google Calendar.` };
        }
        logActivity({ agent: p.agent, verb: "Moved", line: `${payload.summary ?? "Meeting"} → ${to} (mock)`, state: "auto" });
        return { ok: true, live: false, result: `Rescheduled to ${to}. Connect Google Calendar to write it live.` };
      }
      case "calendar_create": {
        const payload = (p.payload ?? {}) as { summary?: string; time?: string; durationMin?: number };
        const time = payload.time ?? "16:00";
        if (calendarConnected()) {
          const { startISO, endISO } = todayAt(time, payload.durationMin ?? 60);
          const id = await createEvent({ summary: payload.summary ?? "Zenra hold", startISO, endISO, description: p.why });
          logActivity({ agent: p.agent, verb: "Held", line: `${payload.summary ?? "block"} at ${time}`, state: "done" });
          return { ok: true, live: true, externalId: id ?? undefined, result: `Blocked ${time} on your calendar.` };
        }
        logActivity({ agent: p.agent, verb: "Held", line: `${payload.summary ?? "block"} at ${time} (mock)`, state: "auto" });
        return { ok: true, live: false, result: `Created the hold for ${time}. Connect Calendar to write it live.` };
      }
      case "slack_dnd": {
        const payload = (p.payload ?? {}) as { minutes?: number; until?: string };
        const minutes = payload.minutes ?? 120;
        if (slackConfigured()) {
          const r = await setDnd(minutes);
          logActivity({ agent: p.agent, verb: "Held", line: `Slack pings held until ${payload.until ?? "later"}`, state: r.ok ? "done" : "skipped" });
          return { ok: r.ok, live: r.ok, result: r.ok ? `Slack is on Do Not Disturb until ${payload.until ?? `${minutes}m`}.` : `Tried to hold Slack — ${r.detail}` };
        }
        logActivity({ agent: p.agent, verb: "Held", line: `Slack pings held (mock)`, state: "auto" });
        return { ok: true, live: false, result: `Holding pings until ${payload.until ?? "later"}. Connect Slack to enforce it live.` };
      }
      case "slack_status":
      case "slack_message": {
        const payload = (p.payload ?? {}) as { text?: string };
        const text = payload.text ?? `${agent.name}: ${p.title}`;
        if (slackConfigured()) {
          const r = await postMessage(text);
          logActivity({ agent: p.agent, verb: "Posted", line: text, state: r.ok ? "done" : "skipped" });
          return { ok: r.ok, live: r.ok, result: r.ok ? "Sent to Slack." : `Slack: ${r.detail}` };
        }
        return { ok: true, live: false, result: "Connect Slack to send this live." };
      }
      default: {
        // nutrition / movement / sleep / reflection / note — internal commitments
        logActivity({ agent: p.agent, verb: "Set", line: p.title, state: "done" });
        return { ok: true, live: false, result: `${agent.name} has it handled.` };
      }
    }
  } catch (e) {
    return { ok: false, live: false, result: e instanceof Error ? e.message : "Something went wrong executing this." };
  }
}
