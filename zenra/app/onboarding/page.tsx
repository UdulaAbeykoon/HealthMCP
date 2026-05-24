"use client";

import { useState } from "react";
import Link from "next/link";
import { AgentGlyph, GlyphSvg } from "@/components/AgentGlyph";
import { I } from "@/components/Icons";
import { AGENT_LIST, AGENTS, type AgentId } from "@/lib/agents";
import { USER } from "@/lib/seed";

// ── Step 1: Hello ────────────────────────────────────────────────────
function StepHello() {
  return (
    <div className="zr-fade-in">
      <div className="zr-eyebrow" style={{ marginBottom: 14 }}>Welcome</div>
      <h1
        className="zr-serif"
        style={{ fontSize: 52, lineHeight: 1.04, marginBottom: 18, color: "var(--text)" }}
      >
        Hello, {USER.name}.
      </h1>
      <p style={{ fontSize: 16, color: "var(--text-dim)", maxWidth: 520, lineHeight: 1.65, marginBottom: 36 }}>
        I'm Zenra — actually, I'm a small team of agents. We quietly arrange your day
        around how you <em style={{ fontStyle: "italic", color: "var(--text)" }}>actually feel</em>, protecting
        your energy so you can show up for the things that matter.
      </p>

      <div
        className="zr-card"
        style={{ padding: 22, marginBottom: 12, maxWidth: 640 }}
      >
        <div className="zr-eyebrow" style={{ marginBottom: 14 }}>Meet the team</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {(["sage", "lyra", "atlas", "orchid", "echo", "fern", "iris"] as AgentId[]).map((id, i) => {
            const a = AGENTS[id];
            return (
              <div
                key={id}
                className="zr-pop"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 68, animationDelay: `${i * 60}ms` }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: `color-mix(in oklab, ${a.color}, transparent 80%)`,
                    display: "grid",
                    placeItems: "center",
                    color: a.color,
                  }}
                >
                  <span style={{ width: 22, height: 22 }}>
                    <GlyphSvg id={id} />
                  </span>
                </span>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "var(--text)" }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-mute)" }}>{a.role}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Your goals ───────────────────────────────────────────────
const GOAL_PILLS = [
  "Sleep deeper",
  "Train consistently",
  "Protect focus",
  "Protect family dinners",
  "Eat earlier",
  "Less Slack anxiety",
  "More energy by 3pm",
  "Lower resting HR",
  "Calm the mental chatter",
  "Stick to a wind-down",
];

function StepGoals({
  selected,
  toggle,
}: {
  selected: Set<string>;
  toggle: (g: string) => void;
}) {
  return (
    <div className="zr-fade-in">
      <div className="zr-eyebrow" style={{ marginBottom: 12 }}>Your goals</div>
      <h1
        className="zr-serif"
        style={{ fontSize: 44, lineHeight: 1.05, marginBottom: 10 }}
      >
        What actually matters?
      </h1>
      <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 28, maxWidth: 500, lineHeight: 1.6 }}>
        Pick 3–5. We focus, not boil the ocean. You can always add more later.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          maxWidth: 620,
          marginBottom: 20,
        }}
      >
        {GOAL_PILLS.map((g) => {
          const on = selected.has(g);
          return (
            <button
              key={g}
              onClick={() => toggle(g)}
              className={"zr-pill" + (on ? " accent" : "")}
              style={{
                cursor: "pointer",
                fontSize: 13,
                padding: "8px 16px",
                transition: "background .15s, color .15s",
              }}
            >
              {on && <span className="dot" />}
              {g}
            </button>
          );
        })}
      </div>
      {selected.size > 0 && (
        <p style={{ fontSize: 12, color: "var(--text-mute)" }}>
          {selected.size} selected{selected.size < 3 ? " — pick at least 3" : selected.size > 5 ? " — maybe narrow it down?" : " — nice."}
        </p>
      )}
    </div>
  );
}

// ── Step 3: Your rhythm ──────────────────────────────────────────────
function RhythmInput({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <div className="zr-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <input
        className="zr-input zr-mono"
        defaultValue={defaultValue}
        style={{ maxWidth: 200 }}
      />
    </div>
  );
}

function StepRhythm() {
  return (
    <div className="zr-fade-in">
      <div className="zr-eyebrow" style={{ marginBottom: 12 }}>Your rhythm</div>
      <h1 className="zr-serif" style={{ fontSize: 44, lineHeight: 1.05, marginBottom: 10 }}>
        When do you naturally thrive?
      </h1>
      <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 28, maxWidth: 520, lineHeight: 1.6 }}>
        These anchor your schedule. Your agents will work around these windows — and gently nudge when something's slipping.
      </p>
      <div
        className="zr-card"
        style={{ maxWidth: 560, display: "grid", gap: 18, padding: 28 }}
      >
        <RhythmInput label="Wake target" defaultValue="06:30" />
        <RhythmInput label="Bedtime target" defaultValue="22:30" />
        <div className="zr-divider" style={{ margin: "4px 0" }} />
        <RhythmInput label="Deep work window" defaultValue="08:00 – 11:30" />
        <RhythmInput label="Workout window" defaultValue="16:00 – 17:30" />
        <RhythmInput label="Quiet hours" defaultValue="21:00 – 06:30" />
      </div>
    </div>
  );
}

// ── Step 4: Autonomy ─────────────────────────────────────────────────
const AUTONOMY_OPTIONS = [
  {
    id: "observe",
    t: "Observe only",
    d: "Watch and tell me what's happening. I'll act.",
    ex: "Daily summary, no nudges.",
  },
  {
    id: "copilot",
    t: "Co-pilot",
    d: "Propose actions and wait for me. Default for new agents.",
    ex: "\"Want me to push your 9am?\"",
    recommended: true,
  },
  {
    id: "trusted",
    t: "Trusted autopilot",
    d: "Auto-handle reversible, low-stakes actions. Tell me what you did.",
    ex: "Auto-rescheduled internal sync.",
  },
  {
    id: "full",
    t: "Full autopilot",
    d: "Coordinate everything within my rules. Interrupt only on emergencies.",
    ex: "Whole-day choreography.",
  },
];

function StepAutonomy({
  picked,
  setPicked,
}: {
  picked: string;
  setPicked: (v: string) => void;
}) {
  return (
    <div className="zr-fade-in">
      <div className="zr-eyebrow" style={{ marginBottom: 12 }}>Autonomy</div>
      <h1 className="zr-serif" style={{ fontSize: 44, lineHeight: 1.05, maxWidth: 560, marginBottom: 10 }}>
        How much should we{" "}
        <em style={{ fontStyle: "italic", color: "var(--accent)" }}>do</em> on your behalf?
      </h1>
      <p style={{ color: "var(--text-dim)", fontSize: 15, maxWidth: 520, marginBottom: 24, lineHeight: 1.6 }}>
        You can change this any time — and override per-agent. We default to{" "}
        <b style={{ color: "var(--text)" }}>Co-pilot</b>: we propose, you decide.
      </p>

      <div style={{ display: "grid", gap: 10, maxWidth: 640, marginBottom: 20 }}>
        {AUTONOMY_OPTIONS.map((o) => {
          const on = picked === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setPicked(o.id)}
              className="zr-card zr-lift zr-press"
              style={{
                padding: 16,
                borderColor: on ? "var(--accent)" : "var(--border)",
                background: on
                  ? "linear-gradient(160deg, var(--accent-soft), transparent 80%), var(--surface-2)"
                  : "var(--surface-2)",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color .15s, background .15s",
                width: "100%",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: `1.5px solid ${on ? "var(--accent)" : "var(--border-strong)"}`,
                  background: on ? "var(--accent)" : "transparent",
                  marginTop: 4,
                  flex: "0 0 auto",
                  transition: "background .15s",
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 15, color: "var(--text)" }}>{o.t}</span>
                  {o.recommended && (
                    <span className="zr-pill accent" style={{ fontSize: 10 }}>
                      Recommended
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>{o.d}</div>
                <div
                  className="zr-mono"
                  style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 6 }}
                >
                  e.g. {o.ex}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 10,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          maxWidth: 640,
        }}
      >
        <span
          style={{ color: "var(--text-mute)", display: "grid", placeItems: "center", width: 18, height: 18, flex: "0 0 auto" }}
        >
          {I.info}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
          You'll see why every action is proposed. You can override per-agent in Settings.
        </span>
      </div>
    </div>
  );
}

// ── Step 5: Connect ──────────────────────────────────────────────────
const SOURCES = [
  { id: "oura", name: "Oura Ring", note: "Sleep, HRV, temp · primary", canLink: true },
  { id: "apple", name: "Apple Health", note: "Steps, mindful minutes, ECG", canLink: true },
  {
    id: "gcal",
    name: "Google Calendar",
    note: "Connect live in Integrations",
    canLink: false,
    live: true,
  },
  { id: "slack", name: "Slack", note: "Connect live in Integrations", canLink: false, live: true },
  { id: "strava", name: "Strava", note: "Training load + workouts", canLink: true },
];

function StepConnect({
  linked,
  toggle,
}: {
  linked: Set<string>;
  toggle: (id: string) => void;
}) {
  return (
    <div className="zr-fade-in">
      <div className="zr-eyebrow" style={{ marginBottom: 12 }}>Connect data</div>
      <h1 className="zr-serif" style={{ fontSize: 44, lineHeight: 1.05, marginBottom: 10 }}>
        Where does your signal live?
      </h1>
      <p
        style={{
          color: "var(--text-dim)",
          fontSize: 15,
          maxWidth: 520,
          marginBottom: 28,
          lineHeight: 1.6,
        }}
      >
        The more context we have, the better we protect your energy. Skip anything — you
        can always connect later.
      </p>

      <div className="zr-card flush" style={{ maxWidth: 580 }}>
        {SOURCES.map((s, i) => {
          const on = linked.has(s.id);
          return (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 20px",
                borderTop: i ? "1px solid var(--border)" : "none",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: on ? "var(--positive)" : "var(--text-faint)",
                  flex: "0 0 auto",
                  transition: "background .2s",
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text)" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>{s.note}</div>
              </div>
              {s.live ? (
                <span
                  className="zr-pill"
                  style={{ fontSize: 11, color: "var(--text-mute)" }}
                >
                  Later
                </span>
              ) : (
                <button
                  onClick={() => toggle(s.id)}
                  className={"zr-btn sm zr-press" + (on ? " primary" : "")}
                  style={{ fontSize: 12 }}
                >
                  {on ? "Linked" : "Link"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 6: Promise ──────────────────────────────────────────────────
function StepPromise() {
  return (
    <div className="zr-fade-in">
      <div className="zr-eyebrow" style={{ marginBottom: 14 }}>One promise</div>
      <h1
        className="zr-serif"
        style={{ fontSize: 44, lineHeight: 1.1, maxWidth: 560, marginBottom: 24 }}
      >
        I won't replace your doctor, your gut, or your weekend.
      </h1>
      <p
        className="zr-serif"
        style={{
          fontSize: 22,
          lineHeight: 1.5,
          color: "var(--text-dim)",
          maxWidth: 520,
          marginBottom: 32,
        }}
      >
        I'll explain every nudge. You can mute me with one tap.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
        <span className="zr-pill">
          <span className="dot" />
          Not medical advice
        </span>
        <span className="zr-pill">
          <span className="dot" />
          Your data stays yours
        </span>
        <span className="zr-pill">
          <span className="dot" />
          Mute any agent, any time
        </span>
      </div>

      <div
        className="zr-card"
        style={{
          padding: 24,
          maxWidth: 520,
          background:
            "linear-gradient(160deg, var(--accent-soft), transparent 60%), var(--surface)",
          borderColor: "var(--accent-soft-2)",
        }}
      >
        <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
          Zenra is a personal coordination tool — not a medical device. Agents may be wrong;
          treat every proposal as a starting point, not a verdict. If something worries you
          healthwise, talk to a clinician.
        </div>
      </div>
    </div>
  );
}

// ── Step config ──────────────────────────────────────────────────────
const STEPS = [
  { label: "Hello" },
  { label: "Your goals" },
  { label: "Your rhythm" },
  { label: "Autonomy" },
  { label: "Connect" },
  { label: "Promise" },
];

// ── Main component ───────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<Set<string>>(new Set());
  const [autonomy, setAutonomy] = useState("copilot");
  const [linked, setLinked] = useState<Set<string>>(new Set());

  const toggleGoal = (g: string) => {
    setGoals((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const toggleLinked = (id: string) => {
    setLinked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const advance = () => {
    if (!isLast) setStep((s) => s + 1);
  };
  const back = () => {
    if (!isFirst) setStep((s) => s - 1);
  };

  const nextLabel = () => {
    if (isLast) return null;
    return `Continue → ${STEPS[step + 1].label}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-grad)",
        display: "grid",
        gridTemplateColumns: "1fr 720px 1fr",
        padding: "32px 40px",
      }}
    >
      {/* ── Left rail ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <Link href="/" className="zr-brand" style={{ textDecoration: "none", padding: "4px 0 36px" }}>
          <div className="zr-brand-mark" />
          <div>
            <div className="zr-brand-name">Zenra</div>
            <div className="zr-brand-sub">Health OS</div>
          </div>
        </Link>

        <div style={{ fontSize: 11, color: "var(--text-mute)" }}>
          <div
            style={{
              marginBottom: 10,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              fontSize: 10,
            }}
          >
            Step {step + 1} of {STEPS.length}
          </div>
          {STEPS.map((s, i) => {
            const isCurrent = i === step;
            const isDone = i < step;
            return (
              <div
                key={i}
                style={{
                  padding: "6px 0",
                  color: isCurrent
                    ? "var(--text)"
                    : isDone
                    ? "var(--text-dim)"
                    : "var(--text-mute)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  transition: "color .2s",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: `1px solid ${i <= step ? "var(--accent)" : "var(--border-strong)"}`,
                    background: isDone ? "var(--accent)" : "transparent",
                    color: isDone ? "white" : isCurrent ? "var(--accent)" : "var(--text-faint)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 9,
                    flex: "0 0 auto",
                    transition: "background .2s, border-color .2s",
                  }}
                >
                  {isDone ? (
                    <span style={{ width: 10, height: 10 }}>{I.check}</span>
                  ) : (
                    <span style={{ fontSize: 10 }}>{i + 1}</span>
                  )}
                </span>
                {s.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Center content ── */}
      <div style={{ paddingTop: 24, paddingBottom: 60 }}>
        <div key={step} className="zr-fade-in">
          {step === 0 && <StepHello />}
          {step === 1 && <StepGoals selected={goals} toggle={toggleGoal} />}
          {step === 2 && <StepRhythm />}
          {step === 3 && <StepAutonomy picked={autonomy} setPicked={setAutonomy} />}
          {step === 4 && <StepConnect linked={linked} toggle={toggleLinked} />}
          {step === 5 && <StepPromise />}
        </div>

        {/* ── Navigation ── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginTop: 36,
          }}
        >
          {!isFirst && (
            <button className="zr-btn zr-press" onClick={back}>
              Back
            </button>
          )}

          {isLast ? (
            <Link href="/" className="zr-btn primary zr-press" style={{ textDecoration: "none" }}>
              <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>
                {I.arrow}
              </span>
              Open Zenra
            </Link>
          ) : (
            <button className="zr-btn primary zr-press" onClick={advance}>
              {nextLabel()}
              <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>
                {I.chev}
              </span>
            </button>
          )}

          <span
            style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-mute)" }}
          >
            Press <span className="zr-kbd">↵</span> to continue
          </span>
        </div>
      </div>

      {/* ── Right spacer ── */}
      <div />
    </div>
  );
}
