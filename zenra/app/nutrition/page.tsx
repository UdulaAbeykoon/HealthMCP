"use client";

import { useState } from "react";
import { Shell } from "@/components/Shell";
import { GlyphSvg } from "@/components/AgentGlyph";
import { I } from "@/components/Icons";
import { NUTRITION } from "@/lib/seed";
import { AGENTS } from "@/lib/agents";

// ─── Concentric macro rings (SVG) ────────────────────────────────────
function MacrosRing() {
  const { kcal, kcalTarget, macros } = NUTRITION;
  const size = 200;
  const radii = [80, 66, 52] as const;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        {macros.map((m, i) => {
          const r = radii[i];
          const C = 2 * Math.PI * r;
          const pct = Math.min(1, m.v / m.target);
          const filled = C * pct;
          return (
            <g key={i}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="var(--border)"
                strokeWidth="9"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={m.color}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${filled} ${C - filled}`}
              />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <div className="zr-eyebrow">Today · kcal</div>
        <div className="zr-serif" style={{ fontSize: 36, lineHeight: 1 }}>
          {kcal.toLocaleString()}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
          of {kcalTarget.toLocaleString()} target
        </div>
      </div>
    </div>
  );
}

// ─── Meal row card ────────────────────────────────────────────────────
function MealRow({
  time,
  meal,
  sub,
  kcal,
  protein,
  suggested,
  image,
  accepted,
  onAccept,
}: {
  time: string;
  meal: string;
  sub: string;
  kcal: number;
  protein: number;
  suggested: boolean;
  image: string;
  accepted: boolean;
  onAccept: () => void;
}) {
  return (
    <div
      className="zr-card"
      style={{
        padding: 14,
        display: "grid",
        gridTemplateColumns: "70px 64px 1fr auto auto",
        gap: 14,
        alignItems: "center",
        background: suggested
          ? accepted
            ? "color-mix(in oklab, var(--positive), transparent 90%)"
            : "var(--surface-2)"
          : "var(--surface)",
        borderColor: suggested
          ? accepted
            ? "color-mix(in oklab, var(--positive), transparent 60%)"
            : "var(--accent-soft-2)"
          : "var(--border)",
        transition: "background .2s, border-color .2s",
      }}
    >
      {/* Time */}
      <div
        style={{ fontSize: 12, color: "var(--text-dim)" }}
        className="zr-mono"
      >
        {time}
      </div>

      {/* Image placeholder */}
      <div
        className="zr-ph"
        style={{ height: 64, fontSize: 9 }}
      >
        {image}
      </div>

      {/* Name + sub */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, color: "var(--text)" }}>{meal}</span>
          {suggested && !accepted && (
            <span className="zr-pill accent" style={{ fontSize: 10 }}>
              Fern proposed
            </span>
          )}
          {accepted && (
            <span className="zr-pill positive" style={{ fontSize: 10 }}>
              <span className="dot" />
              Added
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
          {sub}
        </div>
      </div>

      {/* Kcal + protein */}
      <div style={{ textAlign: "right" }}>
        <div className="zr-mono" style={{ fontSize: 15 }}>
          {kcal}
          <span style={{ fontSize: 10, color: "var(--text-mute)" }}> kcal</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--ag-atlas)" }}>
          {protein}g protein
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 4 }}>
        {suggested ? (
          <>
            <button
              className="zr-btn primary sm"
              onClick={onAccept}
              disabled={accepted}
              aria-label="Accept meal"
              style={{ opacity: accepted ? 0.6 : 1 }}
            >
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: 14,
                  height: 14,
                }}
              >
                {I.check}
              </span>
            </button>
            <button className="zr-btn sm" aria-label="Edit meal">
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: 14,
                  height: 14,
                }}
              >
                {I.edit}
              </span>
            </button>
          </>
        ) : (
          <button
            className="zr-btn ghost icon sm"
            aria-label="Options"
          >
            <span
              style={{
                display: "inline-grid",
                placeItems: "center",
                width: 14,
                height: 14,
              }}
            >
              {I.dots}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Hydration tracker ─────────────────────────────────────────────
function HydrationCard({
  glasses,
  goal,
}: {
  glasses: number;
  goal: number;
}) {
  const [filled, setFilled] = useState(glasses);

  const logGlass = () => {
    setFilled((prev) => Math.min(prev + 1, goal));
  };

  return (
    <div className="zr-card">
      <div className="zr-card-head">
        <span className="zr-card-title">Hydration</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {Array.from({ length: goal }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 4,
              background:
                i < filled ? "var(--ag-echo)" : "var(--surface)",
              border: "1px solid var(--border)",
              opacity: i < filled ? 0.8 : 0.5,
              transition: "background .2s, opacity .2s",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--text-dim)",
        }}
      >
        <span>
          {filled} / {goal} glasses
        </span>
        <span className="zr-mono">
          {filled >= goal
            ? "Goal reached!"
            : `+${(goal - filled) * 250} ml needed`}
        </span>
      </div>
      <button
        className="zr-btn sm"
        style={{ marginTop: 10, width: "100%", gap: 8 }}
        onClick={logGlass}
        disabled={filled >= goal}
      >
        <span
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: 14,
            height: 14,
          }}
        >
          {I.drop}
        </span>
        {filled >= goal ? "Goal reached" : "Log a glass"}
      </button>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────
export default function NutritionPage() {
  const [accepted, setAccepted] = useState<Set<number>>(new Set());

  const acceptMeal = (idx: number) => {
    setAccepted((prev) => new Set([...prev, idx]));
  };

  return (
    <Shell>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div className="zr-eyebrow" style={{ marginBottom: 8 }}>
            Fern · planning around today&apos;s load
          </div>
          <h1
            className="zr-serif"
            style={{ fontSize: 36, lineHeight: 1.1, maxWidth: 720 }}
          >
            Front-load protein. Finish dinner before{" "}
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
              7:30
            </em>
            .
          </h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="zr-btn">Swap to vegetarian</button>
          <button className="zr-btn">Generate shopping list</button>
        </div>
      </div>

      {/* ── Three-column body ──────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr 300px",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* ── Left: macro rings + bars ─────────────────────────── */}
        <div
          className="zr-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 22,
          }}
        >
          <MacrosRing />
          <div
            style={{ width: "100%", display: "grid", gap: 8, marginTop: 18 }}
          >
            {NUTRITION.macros.map((m, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: m.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: "var(--text-dim)" }}>{m.k}</span>
                  </span>
                  <span className="zr-mono" style={{ color: "var(--text)" }}>
                    {m.label}
                  </span>
                </div>
                <div className="zr-bar-track">
                  <div
                    className="zr-bar-fill"
                    style={{ width: `${m.p}%`, background: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Center: meal plan ─────────────────────────────────── */}
        <div className="zr-card">
          <div className="zr-card-head">
            <span className="zr-card-title">
              Today&apos;s plan · {NUTRITION.meals.length} meals
            </span>
            <span
              className="zr-card-action"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              Coordinated with Atlas (workout 16:00){" "}
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: 14,
                  height: 14,
                }}
              >
                {I.arrow}
              </span>
            </span>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {NUTRITION.meals.map((m, i) => (
              <MealRow
                key={i}
                {...m}
                accepted={accepted.has(i)}
                onAccept={() => acceptMeal(i)}
              />
            ))}
          </div>
        </div>

        {/* ── Right: hydration + why + pantry ──────────────────── */}
        <div style={{ display: "grid", gap: 14, gridAutoRows: "max-content" }}>
          {/* Hydration */}
          <HydrationCard
            glasses={NUTRITION.hydration.glasses}
            goal={NUTRITION.hydration.goal}
          />

          {/* Why these meals? */}
          <div className="zr-card">
            <div className="zr-card-head">
              <span className="zr-card-title">Why these meals?</span>
            </div>
            <div style={{ display: "grid", gap: 10, fontSize: 12 }}>
              {NUTRITION.why.map((r, i) => {
                const a = AGENTS[r.ag];
                return (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        background: `color-mix(in oklab, ${a.color}, transparent 78%)`,
                        color: a.color,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ width: 12, height: 12 }}>
                        <GlyphSvg id={r.ag} />
                      </span>
                    </span>
                    <span style={{ color: "var(--text-2)" }}>{r.t}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pantry */}
          <div className="zr-card">
            <div className="zr-card-head">
              <span className="zr-card-title">Pantry · in fridge</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {NUTRITION.pantry.map((p, i) => (
                <span key={i} className="zr-pill" style={{ fontSize: 11 }}>
                  {p}
                </span>
              ))}
            </div>
            <button
              className="zr-btn ghost sm"
              style={{ marginTop: 12, width: "100%" }}
            >
              Open shopping list (5 missing)
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
