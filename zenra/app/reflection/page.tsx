"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Shell } from "@/components/Shell";
import { AgentGlyph } from "@/components/AgentGlyph";
import { I } from "@/components/Icons";
import { REFLECTION, USER } from "@/lib/seed";
import { AnimatedNumber, Reveal } from "@/components/anim";

// ─── Mood bar chart (right column) ─────────────────────────────────
function WeekMoodChart({ data }: { data: [string, number][] }) {
  const max = 10;
  const avg =
    REFLECTION.weekMood.reduce((s, [, n]) => s + n, 0) /
    REFLECTION.weekMood.length;

  return (
    <div className="zr-card zr-lift">
      <div className="zr-card-head">
        <span className="zr-card-title">This week&apos;s mood</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height: 110,
        }}
      >
        {data.map(([day, val], i) => {
          const isToday = i === data.length - 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <div
                className="zr-grow"
                style={{
                  width: "100%",
                  height: `${(val / max) * 100}%`,
                  background: isToday
                    ? "linear-gradient(to top, var(--ag-iris), color-mix(in oklab, var(--ag-iris), white 30%))"
                    : "color-mix(in oklab, var(--ag-iris), transparent 60%)",
                  borderRadius: 4,
                  animationDelay: `${i * 60}ms`,
                }}
              />
              <div style={{ fontSize: 10, color: "var(--text-mute)" }}>{day}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
        Average{" "}
        <b className="zr-mono" style={{ color: "var(--text)" }}>
          <AnimatedNumber value={avg} decimals={1} />
        </b>{" "}
        · highest after movement days
      </div>
    </div>
  );
}

// ─── Energy number cell ─────────────────────────────────────────────
function EnergyCell({
  n,
  selected,
  onClick,
}: {
  n: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="zr-press"
      style={{
        flex: 1,
        height: 56,
        borderRadius: 8,
        background: selected ? "var(--accent)" : "var(--surface)",
        border: `1px solid ${selected ? "transparent" : "var(--border)"}`,
        color: selected ? "#1a1208" : "var(--text-dim)",
        display: "grid",
        placeItems: "center",
        fontFamily: "Instrument Serif, Georgia, serif",
        fontSize: 22,
        cursor: "pointer",
        transition: "background .12s, border-color .12s, color .12s, transform .08s",
        userSelect: "none",
        boxShadow: selected ? "0 4px 14px rgba(74,108,247,.22)" : "none",
      }}
    >
      {n}
    </div>
  );
}

// ─── Body feeling pill ───────────────────────────────────────────────
function BodyPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={"zr-pill zr-press" + (selected ? " accent" : "")}
      style={{
        cursor: "pointer",
        padding: "6px 12px",
        fontSize: 12,
        userSelect: "none",
        transition: "background .12s, border-color .12s",
      }}
    >
      {selected && <span className="dot" />}
      {label}
    </span>
  );
}

// ─── Saved confirmation card ─────────────────────────────────────────
function SavedCard({ name }: { name: string }) {
  return (
    <div
      className="zr-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 320,
        gap: 18,
        padding: 40,
        textAlign: "center",
      }}
    >
      <span
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "color-mix(in oklab, var(--ag-iris), transparent 78%)",
          color: "var(--ag-iris)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span style={{ width: 26, height: 26, display: "grid", placeItems: "center" }}>
          {I.check}
        </span>
      </span>
      <h2
        className="zr-serif"
        style={{ fontSize: 28, lineHeight: 1.2, color: "var(--text)" }}
      >
        Saved. Rest well, {name}. — Iris
      </h2>
      <p style={{ fontSize: 14, color: "var(--text-dim)", maxWidth: 360, lineHeight: 1.6 }}>
        I&apos;ll carry today forward quietly. Check in again tomorrow evening.
      </p>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────
export default function ReflectionPage() {
  const [energy, setEnergy] = useState(7);
  const [selectedPills, setSelectedPills] = useState<Set<string>>(
    new Set(["Heavy", "Tense shoulders", "Sleepy"])
  );
  const [entry, setEntry] = useState(
    "Sitting on the back step at 4pm with the dog. No phone. The sun warmed up after the rain. I felt the day uncoil a little."
  );
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = entry
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const togglePill = useCallback((label: string) => {
    setSelectedPills((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    setSaved(true);
  }, []);

  // Cmd/Ctrl + Enter to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  return (
    <Shell>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* ── Left: main check-in card ───────────────────────────── */}
        <div className="zr-card" style={{ padding: 28 }}>
          {saved ? (
            <SavedCard name={USER.name} />
          ) : (
            <>
              {/* Agent header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <AgentGlyph agent="iris" size="lg" />
                <div>
                  <div className="zr-eyebrow">Iris · Reflection</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    9:34 pm · 2 minutes
                  </div>
                </div>
                <button
                  className="zr-btn ghost sm zr-press"
                  style={{ marginLeft: "auto" }}
                >
                  Skip tonight
                </button>
              </div>

              {/* Title */}
              <h1
                className="zr-serif"
                style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 6 }}
              >
                <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
                  How did Sunday land?
                </em>
              </h1>
              <p
                style={{
                  color: "var(--text-dim)",
                  maxWidth: 560,
                  marginBottom: 28,
                }}
              >
                One question at a time. No grading. We&apos;re looking for
                patterns, not perfection.
              </p>

              {/* ── Energy selector ──────────────────────────────── */}
              <div style={{ marginBottom: 26 }}>
                <div className="zr-eyebrow" style={{ marginBottom: 12 }}>
                  Overall energy
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <EnergyCell
                      key={n}
                      n={n}
                      selected={n === energy}
                      onClick={() => setEnergy(n)}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                    fontSize: 11,
                    color: "var(--text-mute)",
                  }}
                >
                  <span>Depleted</span>
                  <span>Steady</span>
                  <span>Charged</span>
                </div>
              </div>

              {/* ── Body feeling pills ───────────────────────────── */}
              <div style={{ marginBottom: 26 }}>
                <div className="zr-eyebrow" style={{ marginBottom: 12 }}>
                  How does the body feel?
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {REFLECTION.bodyPills.map((pill) => (
                    <BodyPill
                      key={pill}
                      label={pill}
                      selected={selectedPills.has(pill)}
                      onClick={() => togglePill(pill)}
                    />
                  ))}
                  <span
                    className="zr-pill zr-press"
                    style={{
                      padding: "6px 12px",
                      borderStyle: "dashed",
                      color: "var(--text-mute)",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-grid",
                        placeItems: "center",
                        width: 12,
                        height: 12,
                      }}
                    >
                      {I.plus}
                    </span>{" "}
                    other
                  </span>
                </div>
              </div>

              {/* ── One small thing ──────────────────────────────── */}
              <div style={{ marginBottom: 26 }}>
                <div className="zr-eyebrow" style={{ marginBottom: 12 }}>
                  One small thing
                </div>
                <div
                  className="zr-serif"
                  style={{
                    fontSize: 22,
                    lineHeight: 1.3,
                    color: "var(--text)",
                    marginBottom: 10,
                  }}
                >
                  What&apos;s one moment today that gave you back energy?
                </div>
                <textarea
                  ref={textareaRef}
                  className="zr-input"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  rows={4}
                  placeholder="Write anything. No wrong answer."
                  style={{
                    resize: "vertical",
                    minHeight: 100,
                    fontSize: 14,
                    lineHeight: 1.55,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    marginTop: 8,
                    fontSize: 11,
                    color: "var(--text-mute)",
                  }}
                >
                  <span className="zr-pill" style={{ fontSize: 10 }}>
                    Hold ⌥ to dictate
                  </span>
                  <span className="zr-pill" style={{ fontSize: 10 }}>
                    {wordCount} / ∞ words
                  </span>
                  <span style={{ marginLeft: "auto" }}>
                    Press <span className="zr-kbd">⌘↵</span> to save
                  </span>
                </div>
              </div>

              {/* ── Actions ─────────────────────────────────────── */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="zr-btn primary zr-press"
                  onClick={handleSave}
                  style={{ gap: 8 }}
                >
                  <span
                    style={{
                      display: "inline-grid",
                      placeItems: "center",
                      width: 16,
                      height: 16,
                    }}
                  >
                    {I.check}
                  </span>
                  Save and rest
                </button>
                <button className="zr-btn zr-press">One more prompt</button>
                <button className="zr-btn ghost zr-press">Voice memo instead</button>
              </div>
            </>
          )}
        </div>

        {/* ── Right: sidebar cards ───────────────────────────────── */}
        <div style={{ display: "grid", gap: 14, gridAutoRows: "max-content" }}>
          {/* Week mood chart */}
          <Reveal delay={0}>
            <WeekMoodChart data={REFLECTION.weekMood} />
          </Reveal>

          {/* Patterns Iris is seeing */}
          <Reveal delay={80}>
            <div className="zr-card zr-lift">
              <div className="zr-card-head">
                <span className="zr-card-title">Patterns Iris is seeing</span>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {REFLECTION.patterns.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 12,
                      color: "var(--text-2)",
                    }}
                  >
                    <span
                      style={{ width: 18, color: "var(--ag-iris)", flexShrink: 0 }}
                      className="zr-serif"
                    >
                      {p.e}
                    </span>
                    <span>{p.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Last entry */}
          <Reveal delay={160}>
            <div className="zr-card zr-lift">
              <div className="zr-card-head">
                <span className="zr-card-title">Last entry · Sat</span>
                <span className="zr-card-action" style={{ cursor: "pointer" }}>
                  Open
                </span>
              </div>
              <p
                className="zr-serif"
                style={{ fontSize: 14, lineHeight: 1.45, color: "var(--text-2)" }}
              >
                {REFLECTION.lastEntry}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Shell>
  );
}
