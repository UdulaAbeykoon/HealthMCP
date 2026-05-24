import { AGENTS } from "./agents";
import type { Proposal } from "./types";
import { logActivity } from "./store";
import { createEvent, deleteEvent, calendarConnected, todayAt, moveEventToTime } from "./integrations/calendar";
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
        const payload = (p.payload ?? {}) as { summary?: string; toTime?: string; durationMin?: number; eventId?: string };
        const to = payload.toTime ?? "10:30";
        if (calendarConnected()) {
          // If we have a real event id, move THAT event (preserving its duration); otherwise create a hold.
          if (payload.eventId) {
            const r = await moveEventToTime(payload.eventId, to);
            if (r.ok) {
              logActivity({ agent: p.agent, verb: "Moved", line: `${payload.summary ?? "Meeting"} → ${to} on your Google Calendar`, state: "done" });
              return { ok: true, live: true, externalId: payload.eventId, result: `Done — moved your meeting to ${to} on Google Calendar.` };
            }
          }
          const { startISO, endISO } = todayAt(to, payload.durationMin ?? 30);
          const id = await createEvent({
            summary: `${payload.summary ?? "Protected time"} (by Orchid)`,
            startISO, endISO,
            description: `Orchid scheduled this to protect your energy. ${p.why}`,
          });
          logActivity({ agent: p.agent, verb: "Moved", line: `${payload.summary ?? "Meeting"} → ${to} on your calendar`, state: "done" });
          return { ok: true, live: true, externalId: id ?? undefined, result: `Done — set for ${to} on your Google Calendar.` };
        }
        logActivity({ agent: p.agent, verb: "Moved", line: `${payload.summary ?? "Meeting"} → ${to} (mock)`, state: "auto" });
        return { ok: true, live: false, result: `Rescheduled to ${to}. Connect Google Calendar to write it live.` };
      }
      case "calendar_delete": {
        const payload = (p.payload ?? {}) as { eventId?: string; summary?: string };
        if (calendarConnected() && payload.eventId) {
          const ok = await deleteEvent(payload.eventId);
          logActivity({ agent: p.agent, verb: "Declined", line: `Removed ${payload.summary ?? "an event"} from your calendar`, state: ok ? "done" : "skipped" });
          return { ok, live: ok, result: ok ? `Cleared ${payload.summary ?? "that event"} off your calendar.` : "Couldn't remove that one." };
        }
        return { ok: true, live: false, result: "Connect Google Calendar to clear this live." };
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
      case "movement":
      case "sleep":
      case "reflection": {
        // These create a real calendar block when the calendar is connected.
        const payload = (p.payload ?? {}) as { time?: string; durationMin?: number; to?: string };
        const time = payload.time ?? (p.kind === "movement" ? "16:00" : p.kind === "sleep" ? "21:45" : "21:30");
        const dur = payload.durationMin ?? (p.kind === "movement" ? 45 : 30);
        const title = p.kind === "movement" ? `${payload.to ?? "Workout"} (Atlas)` : p.kind === "sleep" ? "Wind-down (Lyra)" : "Evening reflection (Iris)";
        if (calendarConnected()) {
          const { startISO, endISO } = todayAt(time, dur);
          const id = await createEvent({ summary: title, startISO, endISO, description: p.why });
          logActivity({ agent: p.agent, verb: "Scheduled", line: `${title} at ${time} on your Google Calendar`, state: "done" });
          return { ok: true, live: true, externalId: id ?? undefined, result: `Added "${title}" at ${time} to your Google Calendar.` };
        }
        logActivity({ agent: p.agent, verb: "Set", line: p.title, state: "done" });
        return { ok: true, live: false, result: `${agent.name} has it locked in for ${time}.` };
      }
      default: {
        // nutrition / note — internal commitments
        logActivity({ agent: p.agent, verb: "Set", line: p.title, state: "done" });
        return { ok: true, live: false, result: `${agent.name} has it handled.` };
      }
    }
  } catch (e) {
    return { ok: false, live: false, result: e instanceof Error ? e.message : "Something went wrong executing this." };
  }
}
