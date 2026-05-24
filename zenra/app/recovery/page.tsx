"use client";
import { Shell } from "@/components/Shell";
import { AgentGlyph } from "@/components/AgentGlyph";
import { I } from "@/components/Icons";
import { MiniSpark } from "@/components/charts";
import { VITALS } from "@/lib/seed";
import { AGENTS } from "@/lib/agents";
import { WORKOUTS, LIFETIME } from "@/lib/health";
import { AnimatedNumber, Reveal, AnimatedRing } from "@/components/anim";

// ── Headline from recovery score ──────────────────────────────────────────────
function recoveryHeadline(score: number): string {
  if (score >= 85) return "You're firing on all cylinders.";
  if (score >= 70) return "You're in good shape today.";
  if (score >= 55) return "Steady — a measured day.";
  return "Your body is rebuilding — go gentle.";
}

// ── Workout type → accent color + icon label ──────────────────────────────────
function workoutMeta(type: string): { color: string; icon: string } {
  switch (type) {
    case "Running":  return { color: "var(--ag-iris)",  icon: "🏃" };
    case "Cycling":  return { color: "var(--ag-atlas)", icon: "🚴" };
    case "Walking":  return { color: "var(--ag-lyra)",  icon: "🚶" };
    default:         return { color: "var(--ag-sage)",  icon: "⚡" };
  }
}

// ── Format a YYYY-MM-DD date to something human ───────────────────────────────
function fmtDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Format firstDay to "Aug 2022" style ───────────────────────────────────────
function fmtMonth(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ── Hypnogram (sleep stage step chart) ──────────────────────────────────────
function Hypnogram() {
  const stages = VITALS.sleep.hypnogram;
  const stageColors = [
    "var(--text-mute)",   // 0 = Awake
    "var(--ag-iris)",     // 1 = REM
    "var(--ag-lyra)",     // 2 = Light
    "var(--accent-2)",    // 3 = Deep
  ];
  const labels = ["Awake", "REM", "Light", "Deep"];
  const W = 760, H = 132;
  const segW = W / stages.length;
  const yOf = (s: number) => s * 26 + 12;

  let d = `M 0 ${yOf(stages[0])}`;
  for (let i = 1; i < stages.length; i++) {
    const x = i * segW;
    d += ` L ${x} ${yOf(stages[i - 1])} L ${x} ${yOf(stages[i])}`;
  }
  d += ` L ${W} ${yOf(stages[stages.length - 1])}`;

  return (
    <Reveal delay={120}>
      <div className="zr-card zr-lift" style={{ padding: 18 }}>
        <div className="zr-card-head">
          <span className="zr-card-title">Last night · hypnogram</span>
          <span className="zr-card-action">
            7h 36m in bed · 7h 04m asleep · {VITALS.sleep.efficiency}% efficiency
            <span style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>{I.arrow}</span>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 12 }}>
          {/* Y-axis labels — ordered bottom→top visually = Awake at top, Deep at bottom */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingTop: 6, paddingBottom: 22 }}>
            {labels.map((l, i) => (
              <div key={l} style={{ fontSize: 10, color: stageColors[i], fontFamily: "JetBrains Mono", letterSpacing: ".06em", textTransform: "uppercase" }}>{l}</div>
            ))}
          </div>

          <div>
            <svg width="100%" height={H + 22} viewBox={`0 0 ${W} ${H + 22}`} preserveAspectRatio="none">
              {/* Row guide lines */}
              {labels.map((_, i) => (
                <line key={i} x1="0" x2={W} y1={yOf(i)} y2={yOf(i)} stroke="var(--border-soft)" />
              ))}
              {/* Filled areas per segment, colored by stage */}
              {stages.map((s, i) => (
                <rect
                  key={i}
                  x={i * segW}
                  y={yOf(s)}
                  width={segW}
                  height={H - yOf(s)}
                  fill={stageColors[s]}
                  fillOpacity=".10"
                />
              ))}
              {/* Step line — animated draw */}
              <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.5" pathLength="1" className="zr-draw" />
              {/* Time labels */}
              {["22:30", "00:00", "02:00", "04:00", "06:00"].map((t, i) => {
                const x = (i / 4) * W;
                return (
                  <text
                    key={t}
                    x={x}
                    y={H + 16}
                    textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
                    fontSize="10"
                    fill="var(--text-mute)"
                    fontFamily="JetBrains Mono"
                  >{t}</text>
                );
              })}
            </svg>

            {/* Stage breakdown 4-up */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 12 }}>
              {VITALS.sleep.stages.map((s) => (
                <div key={s.k}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{s.k}</span>
                    <span style={{ fontSize: 11, color: "var(--text-mute)", marginLeft: "auto" }} className="zr-mono">{s.p}%</span>
                  </div>
                  <div className="zr-serif" style={{ fontSize: 22 }}>{s.v}</div>
                  <div className="zr-bar-track" style={{ marginTop: 6 }}>
                    <div className="zr-bar-fill zr-grow" style={{ width: `${s.p}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ── HRV 14-day chart ─────────────────────────────────────────────────────────
function HRVChart() {
  const data = VITALS.hrv14;
  const baseline = VITALS.hrv.baseline;
  const W = 360, H = 140;
  const max = 70, min = 42;
  const xOf = (i: number) => (i / (data.length - 1)) * W;
  const yOf = (v: number) => H - ((v - min) / (max - min)) * (H - 20) - 6;
  const pts = data.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");
  const area = `0,${H} ${pts} ${W},${H}`;
  const latest = data[data.length - 1];
  const diff = latest - baseline;

  return (
    <Reveal delay={80}>
      <div className="zr-card zr-lift" style={{ padding: 18 }}>
        <div className="zr-card-head">
          <span className="zr-card-title">HRV · 14 days</span>
          <span className="zr-card-action">Trend ↓</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
          <div>
            <div className="zr-serif" style={{ fontSize: 36, lineHeight: 1, color: "var(--text)" }}>
              <AnimatedNumber value={latest} suffix="ms" style={{ fontSize: 36 }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--ag-sage)", marginTop: 4 }}>
              {diff < 0 ? `${diff}ms` : `+${diff}ms`} vs baseline
            </div>
            <span className="zr-pill" style={{ marginTop: 12, fontSize: 10, display: "inline-flex" }}>
              <span className="dot" style={{ background: "var(--warn)" }} />Trending low
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="hrvg" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--ag-sage)" stopOpacity=".25" />
                  <stop offset="100%" stopColor="var(--ag-sage)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" x2={W} y1={yOf(baseline)} y2={yOf(baseline)} stroke="var(--border-strong)" strokeDasharray="2 3" />
              <text x={W - 4} y={yOf(baseline) - 4} textAnchor="end" fontSize="10" fill="var(--text-mute)" fontFamily="JetBrains Mono">
                baseline {baseline}
              </text>
              <polygon points={area} fill="url(#hrvg)" />
              <polyline points={pts} fill="none" stroke="var(--ag-sage)" strokeWidth="1.5" pathLength="1" className="zr-draw" />
              {data.map((v, i) => (
                <circle
                  key={i}
                  cx={xOf(i)}
                  cy={yOf(v)}
                  r={i === data.length - 1 ? 3.5 : 1.5}
                  fill={i === data.length - 1 ? "var(--accent)" : "var(--ag-sage)"}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ── Recovery breakdown rings ──────────────────────────────────────────────────
function RecoveryRings() {
  return (
    <Reveal delay={0}>
      <div className="zr-card zr-lift" style={{ padding: 18 }}>
        <div className="zr-card-head">
          <span className="zr-card-title">Recovery breakdown</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {VITALS.recoveryRings.map((it) => (
            <div key={it.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <AnimatedRing value={it.v} size={92} stroke={6} color={it.color} track="var(--border)">
                <div className="zr-serif" style={{ fontSize: 26 }}>
                  <AnimatedNumber value={it.v} />
                </div>
              </AnimatedRing>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text)" }}>{it.label}</div>
                <div style={{ fontSize: 10, color: "var(--text-mute)" }}>{it.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

// ── Readiness last 7 bar chart ────────────────────────────────────────────────
function SevenDay() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const scores = VITALS.readiness7;
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return (
    <Reveal delay={40}>
      <div className="zr-card zr-lift" style={{ padding: 18 }}>
        <div className="zr-card-head">
          <span className="zr-card-title">Readiness · last 7</span>
          <span className="zr-card-action">avg {avg}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {scores.map((s, i) => {
            const h = (s / 100) * 100;
            const isToday = i === scores.length - 1;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, color: isToday ? "var(--accent)" : "var(--text-mute)", fontFamily: "JetBrains Mono" }}>{s}</div>
                <div
                  className="zr-grow"
                  style={{
                    width: "100%",
                    height: `${h}%`,
                    background: isToday
                      ? "linear-gradient(to top, var(--accent), var(--accent-2))"
                      : "color-mix(in oklab, var(--accent), transparent 70%)",
                    borderRadius: 4,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
                <div style={{ fontSize: 10, color: "var(--text-mute)" }}>{days[i]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

// ── Body signals table with sparklines ───────────────────────────────────────
function VitalsTable() {
  return (
    <Reveal delay={0}>
      <div className="zr-card flush zr-lift">
        <div className="zr-card-head" style={{ padding: "16px 18px 0" }}>
          <span className="zr-card-title">Body signals</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: ".12em", textTransform: "uppercase" }}>
              <th style={{ textAlign: "left", padding: "10px 18px", fontWeight: 400 }}>Signal</th>
              <th style={{ textAlign: "left", padding: "10px 18px", fontWeight: 400 }}>Today</th>
              <th style={{ textAlign: "left", padding: "10px 18px", fontWeight: 400 }}>vs baseline</th>
              <th style={{ textAlign: "right", padding: "10px 18px", fontWeight: 400 }}>7 days</th>
            </tr>
          </thead>
          <tbody>
            {VITALS.bodySignals.map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 18px", fontSize: 13, color: "var(--text-2)" }}>{r.k}</td>
                <td style={{ padding: "12px 18px", fontSize: 14, color: "var(--text)" }} className="zr-mono">{r.v}</td>
                <td style={{ padding: "12px 18px", fontSize: 12, color: "var(--text-dim)" }}>{r.t}</td>
                <td style={{ padding: "8px 18px", width: 140 }}>
                  <MiniSpark color="var(--accent)" values={r.chart} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}

// ── Recent Training card ──────────────────────────────────────────────────────
function RecentTraining() {
  const recent = WORKOUTS.slice(0, 6);

  return (
    <Reveal delay={60}>
      <div className="zr-card zr-lift" style={{ padding: 22 }}>
        <div className="zr-card-head" style={{ marginBottom: 4 }}>
          <span className="zr-card-title">Recent training</span>
          <span className="zr-card-action" style={{ color: "var(--ag-atlas)", fontWeight: 600 }}>
            Atlas
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-mute)", marginBottom: 16 }}>
          Your body&apos;s been busy — here&apos;s what Atlas has logged.
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {recent.map((w, i) => {
            const { color, icon } = workoutMeta(w.type);
            const durationLabel = w.durationMin >= 60
              ? `${Math.floor(w.durationMin / 60)}h ${w.durationMin % 60 > 0 ? `${w.durationMin % 60}m` : ""}`.trim()
              : `${w.durationMin} min`;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "var(--surface-2)",
                  borderRadius: 10,
                  borderLeft: `3px solid ${color}`,
                }}
                className="zr-pop"
              >
                {/* Type tile */}
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 8,
                  background: `color-mix(in oklab, ${color}, transparent 80%)`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {icon}
                </div>

                {/* Type + date */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{w.type}</div>
                  <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{fmtDate(w.date)}</div>
                </div>

                {/* Duration */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="zr-mono" style={{ fontSize: 13, color: "var(--text)" }}>{durationLabel}</div>
                  {w.distanceKm > 0 && (
                    <div className="zr-mono" style={{ fontSize: 11, color: color }}>{w.distanceKm.toFixed(1)} km</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

// ── Lifetime Strip ────────────────────────────────────────────────────────────
function LifetimeStrip() {
  const stats: { label: string; value: number; suffix?: string; decimals?: number; note?: string }[] = [
    { label: "days tracked",  value: LIFETIME.daysTracked },
    { label: "workouts",      value: LIFETIME.totalWorkouts },
    { label: "km logged",     value: LIFETIME.totalDistanceKm, decimals: 0 },
    { label: "ECGs recorded", value: LIFETIME.ecgCount },
  ];

  return (
    <Reveal delay={100}>
      <div
        className="zr-card zr-lift"
        style={{
          padding: "18px 22px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr) auto",
          gap: 12,
          alignItems: "center",
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div className="zr-serif" style={{ fontSize: 28, lineHeight: 1, color: "var(--ag-atlas)" }}>
              <AnimatedNumber value={s.value} decimals={s.decimals ?? 0} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}

        {/* Since label */}
        <div style={{ textAlign: "center", borderLeft: "1px solid var(--border)", paddingLeft: 22 }}>
          <div style={{ fontSize: 11, color: "var(--text-mute)", marginBottom: 2 }}>tracking since</div>
          <div className="zr-mono" style={{ fontSize: 13, color: "var(--ag-atlas)", fontWeight: 600 }}>
            {fmtMonth(LIFETIME.firstDay)}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RecoveryPage() {
  const recoveryScore = VITALS.recovery.score;

  // Sage observations — four agent lines from the artboard
  const observations = [
    { ag: "lyra" as const,  l: `Sleep efficiency ${VITALS.sleep.efficiency}% last night — REM is right where I like it.` },
    { ag: "sage" as const,  l: `HRV ${VITALS.hrv.value}ms, sitting on your ${VITALS.hrv.baseline}ms baseline. Nervous system's settled.` },
    { ag: "atlas" as const, l: `Recovery ${VITALS.recovery.score}/100 with easy days banked — you've earned a harder session today.` },
    { ag: "fern" as const,  l: "Keep dinner before 8pm and the protein up; that's what's holding this streak together." },
  ] as const;

  return (
    <Shell>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 22, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="zr-eyebrow" style={{ marginBottom: 8 }}>Recovery · Sunday, May 24</div>
          <h1 className="zr-serif" style={{ fontSize: 36, lineHeight: 1.1 }}>
            {recoveryHeadline(recoveryScore)}
          </h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="zr-pill">
            <span className="dot" style={{ background: "var(--ag-sage)" }} />Sage
          </span>
          <button className="zr-btn zr-press">
            <span style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>{I.arrow}</span>
            Compare 30d
          </button>
          <button className="zr-btn zr-press">Export</button>
        </div>
      </div>

      {/* 3-col row: rings | 7-day bars | HRV chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <RecoveryRings />
        <SevenDay />
        <HRVChart />
      </div>

      {/* Full-width hypnogram */}
      <div style={{ marginBottom: 14 }}>
        <Hypnogram />
      </div>

      {/* Bottom row: body signals table | Sage observations card */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14 }}>
        <VitalsTable />

        <Reveal delay={40}>
          <div className="zr-card zr-lift" style={{ padding: 22 }}>
            <div className="zr-card-head">
              <span className="zr-card-title">What Sage is reading</span>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {observations.map((x, i) => {
                const a = AGENTS[x.ag];
                return (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <AgentGlyph agent={x.ag} />
                    <div style={{ fontSize: 13, color: "var(--text-2)", paddingTop: 4 }}>
                      <b style={{ color: a.color }}>{a.name}</b> — {x.l}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="zr-divider" />
            <button className="zr-btn primary sm zr-press">
              <span style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>{I.spark}</span>
              Get Sage&apos;s plan to rebuild
            </button>
          </div>
        </Reveal>
      </div>

      {/* Full-width: Recent Training + lifetime strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14 }}>
        <RecentTraining />

        {/* Lifetime strip stacked vertically on the right */}
        <LifetimeStrip />
      </div>
    </Shell>
  );
}
