"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import { I } from "@/components/Icons";
import { Pill } from "@/components/charts";
import { INTEGRATIONS } from "@/lib/seed";
import { AnimatedNumber, Reveal } from "@/components/anim";
import { LIFETIME } from "@/lib/health";

/* ─── Types ──────────────────────────────────────────────────────── */
type ConnState = {
  calendar?: { connected?: boolean; configured?: boolean; account?: string; lastSync?: string };
  slack?: { connected?: boolean; configured?: boolean };
  strava?: { connected?: boolean; configured?: boolean; account?: string };
  gemini?: { available?: boolean };
  voice?: { available?: boolean };
};

type CardData = {
  name: string;
  kind: string;
  status: "connected" | "available";
  lastSync?: string;
  fields?: string[];
  color: string;
  logo: string;
  live?: boolean;
  /** which live action to run when the button is pressed */
  action?: "calendar" | "strava" | "slack";
  busy?: boolean;
  note?: string;
};

/* ─── Spinner (matches feed) ─────────────────────────────────────── */
function Spinner({ size = 12 }: { size?: number }) {
  return (
    <svg className="zr-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

/* ─── Integration card ───────────────────────────────────────────── */
function IntegrationCard({
  card,
  onAct,
}: {
  card: CardData;
  onAct?: (action: "calendar" | "strava" | "slack") => void;
}) {
  const { name, kind, status, lastSync, fields, color, logo, live, action, busy, note } = card;
  const connected = status === "connected";
  return (
    <div
      className="zr-card zr-lift"
      style={{
        padding: 18,
        borderColor: connected ? "var(--border-strong)" : "var(--border)",
        background: connected ? "var(--surface-2)" : "var(--surface)",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `color-mix(in oklab, ${color}, transparent 82%)`,
            color,
            display: "grid",
            placeItems: "center",
            fontFamily: "Instrument Serif, serif",
            fontSize: 20,
            border: `1px solid color-mix(in oklab, ${color}, transparent 70%)`,
          }}
        >
          {logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: "var(--text)", display: "flex", alignItems: "center", gap: 7 }}>
            {name}
            {live && (
              <span
                title="Live integration"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 9,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: color,
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: `color-mix(in oklab, ${color}, transparent 86%)`,
                  border: `1px solid color-mix(in oklab, ${color}, transparent 74%)`,
                }}
              >
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
                Live
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{kind}</div>
        </div>
        {connected ? (
          <Pill variant="positive" style={{ fontSize: 10 }}>
            <span className="dot" />
            Connected
          </Pill>
        ) : (
          <Pill style={{ fontSize: 10, color: "var(--text-mute)" }}>
            <span className="dot" style={{ background: "var(--text-faint)" }} />
            Available
          </Pill>
        )}
      </div>

      {fields && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {fields.map((f, i) => (
            <Pill key={i} style={{ fontSize: 10 }}>
              {f}
            </Pill>
          ))}
        </div>
      )}

      {note && (
        <div
          style={{
            marginBottom: 12,
            fontSize: 11,
            color: "var(--warn)",
            background: "rgba(216,154,76,.10)",
            border: "1px solid color-mix(in oklab, var(--warn), transparent 78%)",
            borderRadius: 8,
            padding: "6px 9px",
          }}
          className="zr-mono"
        >
          {note}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="zr-mono" style={{ fontSize: 11, color: "var(--text-mute)" }}>
          {connected ? `synced ${lastSync ?? "live"}` : "—"}
        </div>
        <button
          className={"zr-btn sm zr-press" + (connected ? "" : " primary")}
          disabled={busy}
          onClick={() => action && onAct?.(action)}
          style={action ? { gap: 6 } : undefined}
        >
          {busy ? <Spinner size={12} /> : null}
          {action === "slack" ? (connected ? "Test" : "Connect") : (action && connected) ? "Manage" : "Connect"}
        </button>
      </div>
    </div>
  );
}

/* ─── Static (demo) integration lists from the artboard ──────────── */
const WEARABLES_EXTRA: CardData[] = [
  { name: "Whoop 5.0", kind: "Strain · alternative", status: "available", logo: "W", color: "var(--ag-atlas)", fields: ["Strain", "Recovery", "Sleep"] },
  { name: "Withings", kind: "Body composition", status: "connected", lastSync: "2h ago", logo: "W", color: "var(--ag-fern)", fields: ["Weight", "Fat %", "BP"] },
  { name: "Continuous glucose", kind: "Stelo / Levels", status: "available", logo: "G", color: "var(--ag-fern)" },
];

const WORK_EXTRA: CardData[] = [
  { name: "Linear", kind: "Work pace signals", status: "connected", lastSync: "6m ago", logo: "L", color: "var(--ag-orchid)", fields: ["Issues closed", "Velocity"] },
  { name: "Notion", kind: "Daily notes inflow", status: "available", logo: "N", color: "var(--text-2)" },
  { name: "Gmail", kind: "Last-resort signal · read-only", status: "available", logo: "@", color: "var(--ag-atlas)" },
  { name: "iMessage / WhatsApp", kind: "Off · we don't read these", status: "available", logo: "", color: "var(--text-mute)" },
];

const ENV_LIST: CardData[] = [
  { name: "Philips Hue", kind: "Lyra dims for wind-down", status: "connected", lastSync: "live", logo: "H", color: "var(--ag-iris)", fields: ["Color", "Schedules"] },
  { name: "Spotify", kind: "Wind-down + focus mixes", status: "connected", lastSync: "active", logo: "S", color: "var(--ag-sage)", fields: ["Now playing", "Playlists"] },
  { name: "Air quality", kind: "Local AQI · IQAir", status: "connected", lastSync: "15m ago", logo: "A", color: "var(--ag-echo)" },
  { name: "Weather", kind: "OpenMeteo · sun + UV", status: "connected", lastSync: "just now", logo: "W", color: "var(--ag-orchid)" },
  { name: "Cronometer", kind: "Manual nutrition log", status: "available", logo: "C", color: "var(--ag-fern)" },
  { name: "Headspace", kind: "Mindful minutes", status: "available", logo: "H", color: "var(--ag-iris)" },
];

/* ─── Section header ─────────────────────────────────────────────── */
function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <h3 className="zr-serif" style={{ fontSize: 22 }}>
        {title}
      </h3>
      {sub && <p style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
  gap: 12,
  marginBottom: 22,
};

/* ─── Banner (reads ?calendar / ?strava — needs Suspense) ────────── */
function ReturnBanner({ onResolved }: { onResolved: () => void }) {
  const params = useSearchParams();
  const cal = params.get("calendar");
  const str = params.get("strava");
  const [dismissed, setDismissed] = useState(false);

  // Re-fetch connections once when we land back from OAuth.
  useEffect(() => {
    if (cal || str) onResolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cal, str]);

  if (dismissed || (!cal && !str)) return null;

  let tone: "ok" | "error" | "warn" = "ok";
  let text = "";
  if (cal === "connected") text = "✓ Google Calendar connected — Orchid can now choreograph your day.";
  else if (cal === "replay") {
    tone = "warn";
    text = "That link was already used — try connecting again.";
  } else if (cal === "error") {
    tone = "error";
    text = "Google Calendar couldn't connect. Give it another try.";
  } else if (str === "connected") text = "✓ Strava connected — Atlas can see your movement now.";
  else if (str === "error") {
    tone = "error";
    text = "Strava couldn't connect. Give it another try.";
  }

  if (!text) return null;

  const color = tone === "ok" ? "var(--positive)" : tone === "warn" ? "var(--warn)" : "var(--danger)";

  return (
    <div
      className="zr-fade-in"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 16px",
        borderRadius: 12,
        marginBottom: 18,
        background: `color-mix(in oklab, ${color}, transparent 90%)`,
        border: `1px solid color-mix(in oklab, ${color}, transparent 78%)`,
        color,
        fontSize: 13,
      }}
    >
      <span style={{ flex: 1 }}>{text}</span>
      <button
        className="zr-btn ghost icon sm"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        style={{ color }}
      >
        <span style={{ width: 13, height: 13, display: "grid", placeItems: "center" }}>{I.x}</span>
      </button>
    </div>
  );
}

/* ─── Page body ──────────────────────────────────────────────────── */
function IntegrationsBody() {
  const [conn, setConn] = useState<ConnState | null>(null);
  const [busy, setBusy] = useState<{ calendar?: boolean; strava?: boolean; slack?: boolean }>({});
  const [notes, setNotes] = useState<{ calendar?: string; strava?: string }>({});
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "error" } | null>(null);

  const refetch = useCallback(() => {
    fetch("/api/connections")
      .then((r) => r.json())
      .then((d: ConnState) => setConn(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const startOAuth = useCallback(async (which: "calendar" | "strava") => {
    setBusy((b) => ({ ...b, [which]: true }));
    setNotes((n) => ({ ...n, [which]: undefined }));
    try {
      const r = await fetch(`/api/${which}/start`);
      const d = await r.json();
      if (d.mode === "needs_setup" || !d.url) {
        const env = which === "calendar" ? "GOOGLE_CLIENT_ID" : "STRAVA_CLIENT_ID";
        setNotes((n) => ({ ...n, [which]: `Add ${env} to .env.local` }));
        setBusy((b) => ({ ...b, [which]: false }));
        return;
      }
      window.location.href = d.url;
    } catch {
      setBusy((b) => ({ ...b, [which]: false }));
    }
  }, []);

  const testSlack = useCallback(async () => {
    setBusy((b) => ({ ...b, slack: true }));
    try {
      const r = await fetch("/api/slack/test", { method: "POST" });
      const d = await r.json();
      if (d.ok) {
        setToast({ text: `Connected to ${d.team ?? "Slack"} — Echo said hello in Slack.`, tone: "ok" });
        refetch();
      } else {
        setToast({ text: d.detail || "Slack couldn't connect.", tone: "error" });
      }
    } catch {
      setToast({ text: "Slack request failed.", tone: "error" });
    } finally {
      setBusy((b) => ({ ...b, slack: false }));
    }
  }, [refetch]);

  const onAct = useCallback(
    (action: "calendar" | "strava" | "slack") => {
      if (action === "slack") testSlack();
      else startOAuth(action);
    },
    [startOAuth, testSlack]
  );

  // ── Build the three LIVE cards from connection state ─────────────
  const calConnected = !!conn?.calendar?.connected;
  const slackConnected = !!conn?.slack?.connected;
  const stravaConnected = !!conn?.strava?.connected;

  const calendarCard: CardData = {
    name: "Google Calendar",
    kind: conn?.calendar?.account ? `Primary · ${conn.calendar.account}` : "Primary · personal + work",
    status: calConnected ? "connected" : "available",
    lastSync: conn?.calendar?.lastSync ?? "live",
    fields: ["Events", "Conflicts", "Travel time", "Quiet blocks"],
    color: "var(--ag-orchid)",
    logo: "G",
    live: true,
    action: "calendar",
    busy: busy.calendar,
    note: notes.calendar,
  };
  const slackCard: CardData = {
    name: "Slack",
    kind: "Echo manages your nudges",
    status: slackConnected ? "connected" : "available",
    lastSync: "live",
    fields: ["Status", "DND", "Mentions"],
    color: "var(--ag-echo)",
    logo: "#",
    live: true,
    action: "slack",
    busy: busy.slack,
  };
  const stravaCard: CardData = {
    name: "Strava",
    kind: conn?.strava?.account ? `Workouts · ${conn.strava.account}` : "Workouts",
    status: stravaConnected ? "connected" : "available",
    lastSync: "yesterday",
    fields: ["Runs", "Rides", "Power"],
    color: "var(--ag-atlas)",
    logo: "S",
    live: true,
    action: "strava",
    busy: busy.strava,
    note: notes.strava,
  };

  // Wearables: seed (Oura, Apple Health) + the live Strava card + static extras.
  const wearablesSeed = INTEGRATIONS.wearables.filter((w) => w.name !== "Withings").map(
    (w) => ({ ...w, status: w.status as "connected" | "available" }) as CardData
  );
  // Withings sits between Whoop and the live Strava card in the artboard order.
  const wearablesCards: CardData[] = [...wearablesSeed, WEARABLES_EXTRA[0], WEARABLES_EXTRA[1], stravaCard, WEARABLES_EXTRA[2]];

  const workCards: CardData[] = [calendarCard, slackCard, ...WORK_EXTRA];

  // ── Header counts ────────────────────────────────────────────────
  const allCards = [...wearablesCards, ...workCards, ...ENV_LIST];
  const connections = allCards.filter((c) => c.status === "connected").length;
  const liveStreams =
    (calConnected ? 1 : 0) +
    (slackConnected ? 1 : 0) +
    (stravaConnected ? 1 : 0) +
    (conn?.gemini?.available ? 1 : 0) +
    (conn?.voice?.available ? 1 : 0);

  return (
    <>
      {/* Transient OAuth-return banner — uses useSearchParams */}
      <Suspense fallback={null}>
        <ReturnBanner onResolved={refetch} />
      </Suspense>

      {/* Slack toast */}
      {toast && (
        <div
          className="zr-fade-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 16px",
            borderRadius: 12,
            marginBottom: 18,
            background: `color-mix(in oklab, ${toast.tone === "ok" ? "var(--positive)" : "var(--danger)"}, transparent 90%)`,
            border: `1px solid color-mix(in oklab, ${toast.tone === "ok" ? "var(--positive)" : "var(--danger)"}, transparent 78%)`,
            color: toast.tone === "ok" ? "var(--positive)" : "var(--danger)",
            fontSize: 13,
          }}
        >
          <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>
            {toast.tone === "ok" ? I.check : I.x}
          </span>
          <span style={{ flex: 1 }}>{toast.text}</span>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        <div>
          <div className="zr-eyebrow" style={{ marginBottom: 8 }}>
            {conn ? `${connections} connections · ${liveStreams} active streams` : "Listening for your signals…"}
          </div>
          <h1 className="zr-serif" style={{ fontSize: 36, lineHeight: 1.1, maxWidth: 660 }}>
            The signals your agents listen to.
          </h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="zr-btn zr-press">Data export</button>
          <button className="zr-btn primary zr-press">
            <span style={{ width: 16, height: 16, display: "grid", placeItems: "center" }}>{I.plus}</span>
            Add a connection
          </button>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────────── */}
      <Reveal delay={80}>
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "linear-gradient(120deg, rgba(232,181,122,.04), transparent 60%), var(--surface-2)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 24,
            marginBottom: 22,
          }}
        >
          <div>
            <div className="zr-eyebrow">Days tracked</div>
            <div className="zr-serif" style={{ fontSize: 26 }}>
              <AnimatedNumber value={LIFETIME.daysTracked} />
            </div>
          </div>
          <div>
            <div className="zr-eyebrow">Workouts logged</div>
            <div className="zr-serif" style={{ fontSize: 26 }}>
              <AnimatedNumber value={LIFETIME.totalWorkouts} />
            </div>
          </div>
          <div>
            <div className="zr-eyebrow">Distance · km</div>
            <div className="zr-serif" style={{ fontSize: 26 }}>
              <AnimatedNumber value={LIFETIME.totalDistanceKm} decimals={1} />
            </div>
          </div>
          <div>
            <div className="zr-eyebrow">ECGs recorded</div>
            <div className="zr-serif" style={{ fontSize: 26 }}>
              <AnimatedNumber value={LIFETIME.ecgCount} />
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Wearables & health ─────────────────────────────────────── */}
      <Reveal delay={120}>
        <SectionHead title="Wearables & health" sub="The body-signal layer." />
        <div style={gridStyle}>
          {wearablesCards.map((c, i) => (
            <IntegrationCard key={c.name + i} card={c} onAct={onAct} />
          ))}
        </div>
      </Reveal>

      {/* ── Work & calendar ────────────────────────────────────────── */}
      <Reveal delay={160}>
        <SectionHead title="Work & calendar" sub="So Orchid and Echo can choreograph." />
        <div style={gridStyle}>
          {workCards.map((c, i) => (
            <IntegrationCard key={c.name + i} card={c} onAct={onAct} />
          ))}
        </div>
      </Reveal>

      {/* ── Environment & lifestyle ────────────────────────────────── */}
      <Reveal delay={200}>
        <SectionHead title="Environment & lifestyle" />
        <div style={gridStyle}>
          {ENV_LIST.map((c, i) => (
            <IntegrationCard key={c.name + i} card={c} />
          ))}
        </div>
      </Reveal>

      {/* ── Permissions ────────────────────────────────────────────── */}
      <div className="zr-card">
        <div className="zr-card-head">
          <span className="zr-card-title">Data &amp; permissions · house rules</span>
          <span className="zr-card-action">
            <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>{I.info}</span>
            What we store ·
            <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>{I.arrow}</span>
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {INTEGRATIONS.permissions.map((p, i) => (
            <div
              key={i}
              style={{ padding: 14, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div style={{ fontSize: 13, color: "var(--text)" }}>{p.t}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{p.d}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function IntegrationsPage() {
  return (
    <Shell>
      <IntegrationsBody />
    </Shell>
  );
}
