"use client";
import { useCallback, useEffect, useState } from "react";
import { I } from "./Icons";

interface CalEvent { id: string; summary: string; startLabel: string; durationMin: number; allDay: boolean; start: string }

export function Agenda({ compact = false }: { compact?: boolean }) {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/calendar/events");
      const d = await r.json();
      setConnected(d.connected);
      setEvents(d.events ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    // refresh when the tab regains focus (e.g. after approving an action elsewhere)
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    const t = setInterval(load, 20000);
    return () => { window.removeEventListener("focus", onFocus); clearInterval(t); };
  }, [load]);

  const today = new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="zr-card zr-lift" style={{ padding: 18 }}>
      <div className="zr-card-head" style={{ marginBottom: 12 }}>
        <span className="zr-card-title">
          <span style={{ width: 14, height: 14, color: "var(--ag-orchid)" }}>{I.plan}</span> Today on your calendar
        </span>
        <span className="zr-card-action">
          {connected ? <span className="zr-pill positive" style={{ fontSize: 10 }}><span className="dot" />Live</span> : null}
        </span>
      </div>

      {!compact && <div className="zr-eyebrow" style={{ marginBottom: 10 }}>{today}</div>}

      {loading ? (
        <div style={{ display: "grid", gap: 8 }}>
          {[0, 1, 2].map((i) => <div key={i} className="zr-shimmer" style={{ height: 34, borderRadius: 8 }} />)}
        </div>
      ) : connected === false ? (
        <div style={{ fontSize: 12, color: "var(--text-mute)", lineHeight: 1.5 }}>
          Google Calendar isn&apos;t connected.{" "}
          <a href="/integrations" style={{ color: "var(--accent)" }}>Connect it</a> and Orchid will choreograph your day.
        </div>
      ) : events.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>
          Your day is clear. Approve a proposal in the{" "}
          <a href="/feed" style={{ color: "var(--accent)" }}>Action Feed</a> and your team will fill it in.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {events.map((e, i) => (
            <div key={e.id || i} className="zr-pop" style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
              borderRadius: 10, background: "var(--surface-3)", border: "1px solid var(--border)",
              animationDelay: `${i * 50}ms`,
            }}>
              <span className="zr-mono" style={{ fontSize: 11, color: "var(--ag-orchid)", minWidth: 58 }}>{e.startLabel}</span>
              <span style={{ fontSize: 13, color: "var(--text-2)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.summary}</span>
              {!e.allDay && e.durationMin > 0 && (
                <span style={{ fontSize: 10, color: "var(--text-mute)" }}>{e.durationMin >= 60 ? `${Math.round(e.durationMin / 60)}h` : `${e.durationMin}m`}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
