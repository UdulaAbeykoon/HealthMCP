"use client";
import { useEffect, useState } from "react";
import { I } from "./Icons";

interface Mem { content: string; createdAt?: string }

export function MemoryPanel() {
  const [memories, setMemories] = useState<Mem[]>([]);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [fact, setFact] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/memory");
    const d = await r.json();
    setAvailable(d.available);
    setMemories(d.memories ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function teach(e: React.FormEvent) {
    e.preventDefault();
    if (!fact.trim() || saving) return;
    setSaving(true);
    const r = await fetch("/api/memory", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remember", fact }),
    });
    const d = await r.json();
    if (d.memories) setMemories(d.memories);
    setFact(""); setSaving(false);
  }

  return (
    <div className="zr-card">
      <div className="zr-card-head">
        <span className="zr-card-title">
          <span style={{ width: 15, height: 15, color: "var(--accent)" }}>{I.spark}</span>
          What Zenra remembers about you
        </span>
        <span className="zr-card-action" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {available ? (
            <><span className="zr-pill positive" style={{ fontSize: 10 }}><span className="dot" />Backboard memory · live</span></>
          ) : (
            <span style={{ fontSize: 11, color: "var(--text-mute)" }}>memory offline</span>
          )}
        </span>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14, maxWidth: 560 }}>
        Your team keeps a persistent memory of your baselines, preferences, and the feedback you give —
        so it gets to know you and improves over time. This is real, stored across sessions.
      </p>

      {loading ? (
        <div style={{ display: "grid", gap: 8 }}>
          {[0, 1, 2].map((i) => <div key={i} className="zr-shimmer" style={{ height: 38, borderRadius: 10 }} />)}
        </div>
      ) : memories.length ? (
        <div style={{ display: "grid", gap: 8 }}>
          {memories.map((m, i) => (
            <div key={i} className="zr-pop" style={{
              display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px",
              borderRadius: 10, background: "var(--surface-3)", border: "1px solid var(--border)",
              animationDelay: `${i * 50}ms`,
            }}>
              <span style={{ width: 16, height: 16, color: "var(--accent)", flex: "0 0 auto", marginTop: 1 }}>{I.check}</span>
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>{m.content}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "var(--text-mute)", padding: "8px 0" }}>
          Nothing yet — teach your team something below, or accept a few proposals and it&apos;ll learn your preferences.
        </div>
      )}

      {available && (
        <form onSubmit={teach} style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input className="zr-input" value={fact} onChange={(e) => setFact(e.target.value)}
            placeholder="Teach Zenra a fact — e.g. “I have a standing family dinner on Sundays.”" />
          <button className="zr-btn primary zr-press" disabled={saving || !fact.trim()} style={{ flex: "0 0 auto" }}>
            {saving ? <span className="zr-spin" style={{ width: 15, height: 15 }}>{I.spark}</span> : <>Remember</>}
          </button>
        </form>
      )}
    </div>
  );
}
