import { google } from "googleapis";
import { getTokens, setTokens, type Tokens } from "../store";

const SCOPE = "https://www.googleapis.com/auth/calendar.events";

export function calendarConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function redirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.OAUTH_REDIRECT_BASE_URL || "http://localhost:3000"}/api/calendar/callback`
  );
}

export function oauthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri()
  );
}

export function authUrl(state: string) {
  return oauthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [SCOPE],
    state,
  });
}

export async function exchangeCode(code: string): Promise<Tokens> {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);
  let account: string | undefined;
  try {
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const me = await oauth2.userinfo.get();
    account = me.data.email ?? undefined;
  } catch {
    /* userinfo scope not granted — fine */
  }
  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token ?? undefined,
    expiresAt: tokens.expiry_date ?? undefined,
    scope: tokens.scope ?? SCOPE,
    account,
  };
}

/** Authenticated calendar client, refreshing tokens if needed. */
async function calendarClient() {
  const t = getTokens("calendar");
  if (!t) return null;
  const client = oauthClient();
  client.setCredentials({
    access_token: t.accessToken,
    refresh_token: t.refreshToken,
    expiry_date: t.expiresAt,
  });
  // persist refreshed tokens
  client.on("tokens", (nt) => {
    setTokens("calendar", {
      accessToken: nt.access_token ?? t.accessToken,
      refreshToken: nt.refresh_token ?? t.refreshToken,
      expiresAt: nt.expiry_date ?? t.expiresAt,
      scope: t.scope,
      account: t.account,
    });
  });
  return google.calendar({ version: "v3", auth: client });
}

export function calendarConnected() {
  return Boolean(getTokens("calendar"));
}

/** Create an event/hold. Returns the created event id, or null in mock mode. */
export async function createEvent(opts: {
  summary: string;
  startISO: string;
  endISO: string;
  description?: string;
}): Promise<string | null> {
  const cal = await calendarClient();
  if (!cal) return null;
  const res = await cal.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: opts.summary,
      description: opts.description,
      start: { dateTime: opts.startISO },
      end: { dateTime: opts.endISO },
      colorId: "9",
    },
  });
  return res.data.id ?? null;
}

export async function moveEvent(eventId: string, startISO: string, endISO: string) {
  const cal = await calendarClient();
  if (!cal) return false;
  await cal.events.patch({
    calendarId: "primary",
    eventId,
    requestBody: { start: { dateTime: startISO }, end: { dateTime: endISO } },
  });
  return true;
}

export async function deleteEvent(eventId: string) {
  const cal = await calendarClient();
  if (!cal) return false;
  await cal.events.delete({ calendarId: "primary", eventId });
  return true;
}

export async function listToday() {
  const cal = await calendarClient();
  if (!cal) return [];
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const res = await cal.events.list({
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });
  return res.data.items ?? [];
}

export interface CalEvent {
  id: string;
  summary: string;
  start: string;      // ISO
  end: string;        // ISO
  allDay: boolean;
  startLabel: string; // "9:30 AM"
  durationMin: number;
}

/** Normalized upcoming events across `days` (default: today + tomorrow). */
export async function listUpcoming(days = 2): Promise<CalEvent[]> {
  const cal = await calendarClient();
  if (!cal) return [];
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setDate(end.getDate() + (days - 1)); end.setHours(23, 59, 59, 999);
  const res = await cal.events.list({
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 25,
  });
  return (res.data.items ?? []).map((e) => {
    const allDay = Boolean(e.start?.date && !e.start?.dateTime);
    const startISO = e.start?.dateTime ?? (e.start?.date ? `${e.start.date}T00:00:00` : new Date().toISOString());
    const endISO = e.end?.dateTime ?? (e.end?.date ? `${e.end.date}T00:00:00` : startISO);
    const s = new Date(startISO), en = new Date(endISO);
    return {
      id: e.id ?? "",
      summary: e.summary ?? "(busy)",
      start: startISO,
      end: endISO,
      allDay,
      startLabel: allDay ? "All day" : s.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      durationMin: Math.max(0, Math.round((en.getTime() - s.getTime()) / 60000)),
    };
  });
}

/** Move an existing event to a new "HH:MM" today, preserving its duration. */
export async function moveEventToTime(eventId: string, hhmm: string): Promise<{ ok: boolean; startISO?: string }> {
  const cal = await calendarClient();
  if (!cal) return { ok: false };
  const ev = await cal.events.get({ calendarId: "primary", eventId });
  const oldStart = ev.data.start?.dateTime ? new Date(ev.data.start.dateTime) : new Date();
  const oldEnd = ev.data.end?.dateTime ? new Date(ev.data.end.dateTime) : new Date(oldStart.getTime() + 30 * 60000);
  const durMs = oldEnd.getTime() - oldStart.getTime();
  const [h, m] = hhmm.split(":").map(Number);
  const newStart = new Date(oldStart); newStart.setHours(h, m, 0, 0);
  const newEnd = new Date(newStart.getTime() + durMs);
  await cal.events.patch({
    calendarId: "primary", eventId,
    requestBody: { start: { dateTime: newStart.toISOString() }, end: { dateTime: newEnd.toISOString() } },
  });
  return { ok: true, startISO: newStart.toISOString() };
}

/** Helper: build today's ISO for a "HH:MM" time. */
export function todayAt(hhmm: string, durationMin = 30): { startISO: string; endISO: string } {
  const [h, m] = hhmm.split(":").map(Number);
  const start = new Date();
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + durationMin * 60_000);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}
