import { WebClient } from "@slack/web-api";

const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

export function slackConfigured() {
  return Boolean(BOT_TOKEN);
}

function client() {
  if (!BOT_TOKEN) throw new Error("SLACK_BOT_TOKEN not set");
  return new WebClient(BOT_TOKEN);
}

/** Set Do Not Disturb for N minutes (Echo holding pings). Requires dnd:write user scope. */
export async function setDnd(minutes: number): Promise<{ ok: boolean; detail?: string }> {
  try {
    const res = await client().dnd.setSnooze({ num_minutes: minutes });
    return { ok: Boolean(res.ok), detail: `Snoozed ${minutes}m` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "Slack error" };
  }
}

/** Post a message to a channel (default: the bot's first channel or provided one). */
export async function postMessage(text: string, channel?: string): Promise<{ ok: boolean; ts?: string; detail?: string }> {
  try {
    const c = client();
    let target = channel;
    if (!target) {
      const list = await c.conversations.list({ limit: 50, types: "public_channel" });
      target = list.channels?.find((ch) => ch.is_member)?.id ?? list.channels?.[0]?.id;
    }
    if (!target) return { ok: false, detail: "No channel available" };
    const res = await c.chat.postMessage({ channel: target, text });
    return { ok: Boolean(res.ok), ts: res.ts, detail: "Posted" };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "Slack error" };
  }
}

export async function authTest(): Promise<{ ok: boolean; team?: string; detail?: string }> {
  try {
    const res = await client().auth.test();
    return { ok: Boolean(res.ok), team: res.team as string };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "Slack error" };
  }
}
