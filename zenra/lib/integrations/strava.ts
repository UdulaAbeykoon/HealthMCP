import { getTokens, setTokens } from "../store";

export function stravaConfigured() {
  return Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET);
}

function redirectUri() {
  return process.env.STRAVA_REDIRECT_URI || `${process.env.APP_BASE_URL || "http://localhost:3000"}/api/strava/callback`;
}

export function authUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    approval_prompt: "auto",
    scope: "activity:read_all",
    state,
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

export async function exchangeCode(code: string) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Strava token exchange failed: ${res.status}`);
  const data = await res.json();
  setTokens("strava", {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at ? data.expires_at * 1000 : undefined,
    account: data.athlete ? `${data.athlete.firstname ?? ""} ${data.athlete.lastname ?? ""}`.trim() : undefined,
  });
  return data;
}

async function accessToken(): Promise<string | null> {
  const t = getTokens("strava");
  if (!t) return null;
  if (t.expiresAt && t.expiresAt < Date.now() + 60_000 && t.refreshToken) {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: t.refreshToken,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setTokens("strava", {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at ? data.expires_at * 1000 : undefined,
        account: t.account,
      });
      return data.access_token;
    }
  }
  return t.accessToken;
}

export async function recentActivities(limit = 5) {
  const token = await accessToken();
  if (!token) return [];
  const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}
