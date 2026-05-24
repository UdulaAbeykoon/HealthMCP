"use client";

import { useState, type ReactNode } from "react";
import { Shell } from "@/components/Shell";
import { AgentGlyph, GlyphSvg } from "@/components/AgentGlyph";
import { I } from "@/components/Icons";
import { AGENTS, AGENT_ORDER, type AgentId } from "@/lib/agents";
import {
  CONDUCTOR_LANES,
  CONDUCTOR_LINKS,
  CONDUCTOR_NETWORK_SIGNALS,
  CONDUCTOR_NETWORK_EDGES,
  REASONING_TRAIL,
} from "@/lib/seed";
import { useProposals } from "@/lib/client";
import type { ReasoningStep } from "@/lib/types";
import { AnimatedNumber, Reveal } from "@/components/anim";

type Variant = 0 | 1 | 2;

const VARIANTS: { id: Variant; label: string }[] = [
  { id: 0, label: "Timeline" },
  { id: 1, label: "Network" },
  { id: 2, label: "Calendar overlay" },
];

// ─────────────────────────────────────────────────────────────────
// Header — title + segmented control
// ─────────────────────────────────────────────────────────────────
function ConductorHeader({ variant, setVariant }: { variant: Variant; setVariant: (v: Variant) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 18, gap: 18, flexWrap: "wrap" }}>
      <div>
        <div className="zr-eyebrow" style={{ marginBottom: 8 }}>The Conductor</div>
        <h1 className="zr-serif" style={{ fontSize: 36, lineHeight: 1.1, maxWidth: 720 }}>
          How your agents are{" "}
          <em style={{ color: "var(--accent)", fontStyle: "italic" }}>quietly coordinating</em> today.
        </h1>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
        <div
          style={{
            display: "inline-flex",
            padding: 3,
            borderRadius: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className="zr-btn sm zr-press"
              style={{
                background: variant === v.id ? "var(--surface-elev)" : "transparent",
                border: 0,
                color: variant === v.id ? "var(--text)" : "var(--text-dim)",
                boxShadow: variant === v.id ? "inset 0 0 0 1px var(--border)" : "none",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-mute)" }}>Three ways to watch the huddle</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Status line — live indicator + counts + re-run button
// ─────────────────────────────────────────────────────────────────
function StatusBar({ huddling, onRerun }: { huddling: boolean; onRerun: () => void }) {
  return (
    <div className="zr-card" style={{ padding: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text)" }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: huddling ? "var(--accent)" : "var(--positive)",
              boxShadow: `0 0 0 0 ${huddling ? "var(--accent)" : "var(--positive)"}`,
              animation: "ctrLivePulse 1.6s ease-out infinite",
            }}
          />
          {huddling ? "Huddling…" : "Live"}
        </span>

        <span style={{ width: 1, height: 16, background: "var(--border)" }} />

        {/* active agents */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {AGENT_ORDER.map((id) => {
            const a = AGENTS[id];
            return (
              <span key={id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: a.color }} />
                <span style={{ fontSize: 12, color: "var(--text-2)" }}>{a.name}</span>
              </span>
            );
          })}
        </div>

        <span className="zr-mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-mute)" }}>
          <AnimatedNumber value={7} /> agents · <AnimatedNumber value={24} /> signals · <AnimatedNumber value={7} /> proposals · <AnimatedNumber value={3} /> commitments
        </span>

        <button className="zr-btn primary sm zr-press" onClick={onRerun} disabled={huddling} style={{ opacity: huddling ? 0.8 : 1 }}>
          {huddling ? (
            <>
              <Spinner /> Your agents are huddling…
            </>
          ) : (
            <>
              <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>{I.spark}</span>
              Re-run the huddle
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="zr-spin"
      style={{
        width: 13,
        height: 13,
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,.4)",
        borderTopColor: "#fff",
        display: "inline-block",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// Variant 0 — TIMELINE swimlanes
// ─────────────────────────────────────────────────────────────────
function ConductorTimeline({ huddling }: { huddling: boolean }) {
  const hours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
  const start = 6,
    end = 22,
    span = end - start;
  const W = 1080;
  const lanes = CONDUCTOR_LANES;
  const rowH = 56;
  const padL = 110;
  const totalH = lanes.length * rowH + 30;
  const xOf = (t: number) => padL + ((t - start) / span) * (W - padL - 20);
  const yOf = (i: number) => 20 + i * rowH + rowH / 2 - 8;
  const nowT = 9.6;

  return (
    <div className="zr-card" style={{ padding: 18 }}>
      <div className="zr-card-head">
        <span className="zr-card-title">Today · 06:00 → 22:00</span>
        <span className="zr-card-action">
          4 coordinations · 12 commitments{" "}
          <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>{I.arrow}</span>
        </span>
      </div>

      <div style={{ position: "relative", height: totalH }}>
        <svg
          width="100%"
          height={totalH}
          viewBox={`0 0 ${W} ${totalH}`}
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {/* hour grid + labels */}
          {hours.map((h, i) => {
            const x = xOf(h);
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={4} y2={totalH - 18} stroke="var(--border-soft)" />
                <text x={x} y={totalH - 4} textAnchor="middle" fontSize="9" fill="var(--text-mute)" fontFamily="JetBrains Mono">
                  {h % 12 || 12}
                  {h < 12 ? "a" : "p"}
                </text>
              </g>
            );
          })}

          {/* now line */}
          <line x1={xOf(nowT)} x2={xOf(nowT)} y1={0} y2={totalH - 18} stroke="var(--accent)" strokeDasharray="3 3" />
          <circle cx={xOf(nowT)} cy={4} r="4" fill="var(--accent)" className="zr-huddle-node" />
          <text
            x={xOf(nowT) + 6}
            y={10}
            fontSize="8"
            fill="var(--accent)"
            fontFamily="JetBrains Mono"
            letterSpacing="1"
          >
            NOW
          </text>

          {/* coordination links: curved bezier between lanes, flowing */}
          {CONDUCTOR_LINKS.map((l, idx) => {
            const fromIdx = lanes.findIndex((L) => L.id === l.fromA);
            const toIdx = lanes.findIndex((L) => L.id === l.toA);
            const x1 = xOf(l.fromT),
              y1 = yOf(fromIdx) + 8;
            const x2 = xOf(l.toT),
              y2 = yOf(toIdx) + 8;
            const dx = (x2 - x1) * 0.5;
            const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
            const mx = (x1 + x2) / 2,
              my = (y1 + y2) / 2;
            return (
              <g key={idx}>
                {/* faint static base */}
                <path d={d} fill="none" stroke="var(--accent)" strokeOpacity=".18" strokeWidth="1" />
                {/* animated flowing dashes */}
                <path
                  className="zr-flow"
                  d={d}
                  fill="none"
                  stroke="var(--accent)"
                  strokeOpacity=".55"
                  strokeWidth="1.4"
                  style={{ animationDelay: `${idx * 0.25}s` }}
                />
                <circle cx={x1} cy={y1} r="2.5" fill="var(--accent)" className="zr-huddle-node" style={{ animationDelay: `${idx * 0.3}s` }} />
                <circle cx={x2} cy={y2} r="2.5" fill="var(--accent)" className="zr-huddle-node" style={{ animationDelay: `${idx * 0.3 + 0.4}s` }} />
                <text x={mx} y={my - 5} textAnchor="middle" fontSize="8.5" fill="var(--text-dim)" style={{ pointerEvents: "none" }}>
                  {l.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* lanes (HTML overlay for crisp typography) */}
        {lanes.map((lane, i) => {
          const a = AGENTS[lane.id];
          return (
            <div
              key={lane.id}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 20 + i * rowH,
                height: rowH,
                borderTop: i === 0 ? "none" : "1px dashed var(--border-soft)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: rowH / 2 - 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: padL - 8,
                }}
              >
                <span className="zr-huddle-node" style={{ display: "inline-flex", animationDelay: `${i * 0.4}s` }}>
                  <AgentGlyph agent={lane.id} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12 }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-mute)" }}>{a.role}</div>
                </div>
              </div>
              {lane.events.map((ev, j) => {
                const x = (xOf(ev.s) / W) * 100;
                const w = ((xOf(ev.e) - xOf(ev.s)) / W) * 100;
                const isBlock = ev.kind === "block";
                const isWatch = ev.kind === "watch";
                return (
                  <div
                    key={j}
                    className={huddling ? "zr-fade-in" : undefined}
                    style={{
                      position: "absolute",
                      left: `${x}%`,
                      width: `${w}%`,
                      top: rowH / 2 - 14,
                      height: 28,
                      borderRadius: 7,
                      background: isBlock
                        ? `color-mix(in oklab, ${a.color}, transparent 78%)`
                        : isWatch
                        ? `color-mix(in oklab, ${a.color}, transparent 92%)`
                        : "transparent",
                      border: `1px ${ev.kind === "signal" ? "dashed" : "solid"} color-mix(in oklab, ${a.color}, transparent ${
                        isBlock ? 55 : 78
                      }%)`,
                      padding: "0 8px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 11,
                      color: "var(--text-2)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ev.kind === "signal" && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: a.color,
                          marginRight: 6,
                          flex: "0 0 auto",
                        }}
                      />
                    )}
                    {ev.t}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Variant 1 — NETWORK radial graph
// ─────────────────────────────────────────────────────────────────
function ConductorNetwork({ huddling }: { huddling: boolean }) {
  const W = 1080,
    H = 560;
  const cx = W / 2,
    cy = H / 2;
  const R = 200;
  const ids = AGENT_ORDER;
  const positions = ids.map((id, i) => {
    const ang = -Math.PI / 2 + (i / ids.length) * Math.PI * 2;
    return { id, x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R };
  });
  const pos = (id: AgentId) => positions.find((p) => p.id === id)!;

  return (
    <div className="zr-card" style={{ padding: 18 }}>
      <div className="zr-card-head">
        <span className="zr-card-title">Live coordination graph</span>
        <span className="zr-card-action">
          Signals on the ring · proposals through the center{" "}
          <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>{I.arrow}</span>
        </span>
      </div>
      <div style={{ position: "relative" }}>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id="ctrGlow">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity=".35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* center glow — breathing */}
          <circle cx={cx} cy={cy} r="80" fill="url(#ctrGlow)" className="zr-huddle-node" />
          <circle cx={cx} cy={cy} r="92" fill="none" stroke="var(--accent)" strokeOpacity=".12" />

          {/* signal connections (dashed, flowing inward) */}
          {CONDUCTOR_NETWORK_SIGNALS.map((s, i) => {
            const p = pos(s.to as AgentId);
            const sx = cx + Math.cos(s.ang) * s.r;
            const sy = cy + Math.sin(s.ang) * s.r;
            return (
              <g key={s.id}>
                <line
                  className="zr-flow"
                  x1={sx}
                  y1={sy}
                  x2={p.x}
                  y2={p.y}
                  stroke={AGENTS[s.to as AgentId].color}
                  strokeOpacity=".5"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
                <circle cx={sx} cy={sy} r="3" fill={AGENTS[s.to as AgentId].color} className="zr-huddle-node" style={{ animationDelay: `${i * 0.2}s` }} />
              </g>
            );
          })}

          {/* proposal edges between agents (curve through center), stagger-drawing in */}
          {CONDUCTOR_NETWORK_EDGES.map((e, i) => {
            const a = pos(e.from as AgentId),
              b = pos(e.to as AgentId);
            const mx = (a.x + b.x) / 2,
              my = (a.y + b.y) / 2;
            const tx = cx + (mx - cx) * 0.25,
              ty = cy + (my - cy) * 0.25;
            const d = `M ${a.x} ${a.y} Q ${tx} ${ty} ${b.x} ${b.y}`;
            // approximate path length for draw-in animation
            const len = Math.hypot(a.x - tx, a.y - ty) + Math.hypot(b.x - tx, b.y - ty);
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke="var(--accent)"
                  strokeOpacity=".5"
                  strokeWidth={e.weight}
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: len,
                    strokeDashoffset: len,
                    animation: `ctrDraw 0.9s ease forwards`,
                    animationDelay: `${i * 0.18 + (huddling ? 0 : 0.1)}s`,
                  }}
                />
                <circle
                  cx={tx + (a.x - cx) * 0.02}
                  cy={ty + (a.y - cy) * 0.02}
                  r="6"
                  fill="var(--surface-2)"
                  stroke="var(--accent)"
                  strokeWidth="1"
                  style={{ opacity: 0, animation: "ctrPop 0.4s ease forwards", animationDelay: `${i * 0.18 + 0.5}s` }}
                />
              </g>
            );
          })}

          {/* center label */}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="var(--text-mute)" fontFamily="JetBrains Mono" letterSpacing="2">
            CONDUCTOR
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize="22" fill="var(--text)" fontFamily="Instrument Serif, serif">
            7 proposals · 1 day
          </text>

          {/* signal labels */}
          {CONDUCTOR_NETWORK_SIGNALS.map((s) => {
            const sx = cx + Math.cos(s.ang) * (s.r + 6);
            const sy = cy + Math.sin(s.ang) * (s.r + 6);
            const anchor = sx < cx - 20 ? "end" : sx > cx + 20 ? "start" : "middle";
            return (
              <text key={s.id} x={sx} y={sy} textAnchor={anchor} fontSize="10" fill="var(--text-dim)" dominantBaseline="middle">
                {s.label}
              </text>
            );
          })}
        </svg>

        {/* agent nodes overlay for sharp glyphs */}
        {positions.map((p, i) => {
          const a = AGENTS[p.id];
          return (
            <div
              key={p.id}
              className="zr-huddle-node"
              style={{
                position: "absolute",
                left: `${(p.x / W) * 100}%`,
                top: `${(p.y / H) * 100}%`,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                animationDelay: `${i * 0.35}s`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: `color-mix(in oklab, ${a.color}, transparent 80%)`,
                  border: `1px solid color-mix(in oklab, ${a.color}, transparent 55%)`,
                  display: "grid",
                  placeItems: "center",
                  color: a.color,
                  boxShadow: `0 0 0 6px var(--bg), 0 0 24px color-mix(in oklab, ${a.color}, transparent 70%)`,
                }}
              >
                <span style={{ width: 26, height: 26 }}>
                  <GlyphSvg id={a.id} />
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text)" }}>{a.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-mute)", marginTop: -4 }}>{a.role}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Variant 2 — CALENDAR overlay (week heat map)
// ─────────────────────────────────────────────────────────────────
function ConductorCalendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = [19, 20, 21, 22, 23, 24, 25];
  const hours = [6, 9, 12, 15, 18, 21];
  const cells: Record<string, AgentId[]> = {};
  const setCell = (d: number, h: number, agents: AgentId[]) => {
    cells[`${d}-${h}`] = agents;
  };
  for (let d = 0; d < 7; d++) {
    setCell(d, 6, ["lyra"]);
    setCell(d, 9, d === 6 ? ["orchid", "echo"] : ["orchid"]);
    setCell(d, 12, ["fern"]);
    setCell(d, 15, ["echo", "orchid"]);
    setCell(d, 18, d % 2 ? ["atlas", "fern"] : ["fern"]);
    setCell(d, 21, ["lyra", "iris"]);
  }
  setCell(6, 9, ["orchid", "lyra", "echo"]);
  setCell(6, 15, ["atlas", "echo"]);
  setCell(6, 18, ["fern", "iris"]);

  return (
    <div className="zr-card" style={{ padding: 18 }}>
      <div className="zr-card-head">
        <span className="zr-card-title">Week of May 19 · agent activity</span>
        <span className="zr-card-action">
          Each cell shows which agents touched the slot{" "}
          <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>{I.arrow}</span>
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "44px repeat(7, 1fr)", gap: 4 }}>
        <div />
        {days.map((d, i) => (
          <div key={d} style={{ textAlign: "center", padding: "6px 0", fontSize: 11 }}>
            <div className="zr-mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>
              {d.toUpperCase()}
            </div>
            <div className="zr-serif" style={{ fontSize: 22, color: i === 6 ? "var(--accent)" : "var(--text)" }}>
              {dates[i]}
            </div>
          </div>
        ))}

        {hours.map((h) => (
          <div key={h} style={{ display: "contents" }}>
            <div
              className="zr-mono"
              style={{
                fontSize: 10,
                color: "var(--text-mute)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 6,
              }}
            >
              {h % 12 || 12}
              {h < 12 ? "a" : "p"}
            </div>
            {days.map((_, di) => {
              const cellAgents = cells[`${di}-${h}`] || [];
              const isToday = di === 6;
              return (
                <div
                  key={di}
                  style={{
                    background: isToday ? "var(--surface-2)" : "var(--surface)",
                    border: `1px solid ${isToday ? "var(--accent-soft-2)" : "var(--border)"}`,
                    borderRadius: 8,
                    minHeight: 64,
                    padding: 6,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    position: "relative",
                  }}
                >
                  {cellAgents.map((id, i) => {
                    const a = AGENTS[id];
                    return (
                      <div
                        key={i}
                        style={{
                          height: 14,
                          borderRadius: 3,
                          background: `color-mix(in oklab, ${a.color}, transparent ${isToday ? 60 : 75}%)`,
                          borderLeft: `2px solid ${a.color}`,
                          padding: "0 4px",
                          fontSize: 9,
                          color: isToday ? "var(--text)" : "var(--text-dim)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {a.name}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 10,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: "var(--accent)", width: 16, height: 16, display: "grid", placeItems: "center" }}>{I.spark}</span>
        <span style={{ fontSize: 12, color: "var(--text-2)", maxWidth: 720, flex: 1 }}>
          <b style={{ color: "var(--text)" }}>This week&apos;s pattern:</b> Fern, Iris and Lyra are coordinating to pull
          dinner earlier — three nights running. Today they&apos;re aligned with Echo to keep the evening quiet.
        </span>
        <button className="zr-btn sm" style={{ marginLeft: "auto" }}>
          See reasoning
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Reasoning trail (shared) — live data with seed fallback
// ─────────────────────────────────────────────────────────────────
function ReasoningTrail({ steps, huddling }: { steps: ReasoningStep[]; huddling: boolean }) {
  const data = steps.length > 0 ? steps : REASONING_TRAIL;
  return (
    <div className="zr-card">
      <div className="zr-card-head">
        <span className="zr-card-title">
          Reasoning trail · this morning
          {huddling && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent)", fontSize: 11 }}>
              <Spinner /> refreshing
            </span>
          )}
        </span>
        <span className="zr-card-action">
          Newest first · everything is explainable{" "}
          <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>{I.arrow}</span>
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "72px 32px 1fr", rowGap: 12, alignItems: "center" }}>
        {data.map((s, i) => {
          const a = AGENTS[s.agent];
          const delay = `${i * 60}ms`;
          return (
            <div key={i} style={{ display: "contents" }}>
              <div className="zr-mono zr-fade-in" style={{ fontSize: 11, color: "var(--text-mute)", animationDelay: delay }}>
                {s.time}
              </div>
              <div
                className="zr-fade-in"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  background: `color-mix(in oklab, ${a.color}, transparent 78%)`,
                  color: a.color,
                  display: "grid",
                  placeItems: "center",
                  animationDelay: delay,
                }}
              >
                <span style={{ width: 14, height: 14 }}>
                  <GlyphSvg id={s.agent} />
                </span>
              </div>
              <div className="zr-fade-in" style={{ fontSize: 13, color: "var(--text-2)", animationDelay: delay }}>
                <b style={{ color: "var(--text)" }}>{a.name}</b> · {s.line}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────
export default function ConductorPage() {
  const [variant, setVariant] = useState<Variant>(0);
  const [huddling, setHuddling] = useState(false);
  const { reasoning, orchestrate } = useProposals();

  const rerun = async () => {
    if (huddling) return;
    setHuddling(true);
    try {
      await orchestrate();
    } finally {
      setHuddling(false);
    }
  };

  const Body: ReactNode =
    variant === 0 ? <ConductorTimeline huddling={huddling} /> : variant === 1 ? <ConductorNetwork huddling={huddling} /> : <ConductorCalendar />;

  return (
    <Shell
      topRight={
        <span className="zr-pill accent">
          <span className="dot" />
          The huddle
        </span>
      }
    >
      <style>{`
        @keyframes ctrLivePulse {
          0% { box-shadow: 0 0 0 0 currentColor; }
          70% { box-shadow: 0 0 0 6px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        @keyframes ctrDraw { to { stroke-dashoffset: 0; } }
        @keyframes ctrPop { to { opacity: 1; } }
      `}</style>

      <ConductorHeader variant={variant} setVariant={setVariant} />
      <StatusBar huddling={huddling} onRerun={rerun} />

      <div style={{ display: "grid", gap: 14 }}>
        <Reveal key={variant}>
          <div className="zr-fade-in">
            {Body}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <ReasoningTrail steps={reasoning} huddling={huddling} />
        </Reveal>
      </div>
    </Shell>
  );
}
