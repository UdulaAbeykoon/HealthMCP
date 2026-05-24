import { notFound } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { AgentGlyph } from "@/components/AgentGlyph";
import { I } from "@/components/Icons";
import { MiniSpark } from "@/components/charts";
import { AGENTS, AGENT_LIST, type AgentId } from "@/lib/agents";
import { AGENT_DETAIL } from "@/lib/seed";

// ── Stat sub-component ────────────────────────────────────────────────────────
function Stat({ label, value, sub, color = "var(--text)" }: {
  label: string;
  value: string;
  sub: string;
  color?: string;
}) {
  return (
    <div>
      <div className="zr-eyebrow">{label}</div>
      <div className="zr-serif" style={{ fontSize: 34, lineHeight: 1.05, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// ── State badge colors ────────────────────────────────────────────────────────
function actionBadgeStyle(state: string): React.CSSProperties {
  if (state === "pending") {
    return { background: "var(--accent-soft)", color: "var(--accent)" };
  }
  if (state === "auto" || state === "done") {
    return { background: "rgba(143,179,154,.14)", color: "var(--positive)" };
  }
  // skipped
  return { background: "rgba(244,228,208,.06)", color: "var(--text-dim)" };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validate id against known agents
  const validIds = Object.keys(AGENTS) as AgentId[];
  if (!validIds.includes(id as AgentId)) {
    notFound();
  }

  const agentId = id as AgentId;
  const a = AGENTS[agentId];

  return (
    <Shell>
      {/* ── Hero card ────────────────────────────────────────────────────── */}
      <div
        className="zr-card"
        style={{
          padding: 28,
          background: `linear-gradient(140deg, color-mix(in oklab, ${a.color}, transparent 88%), transparent 60%), var(--surface-2)`,
          borderColor: `color-mix(in oklab, ${a.color}, transparent 70%)`,
          marginBottom: 14,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial accent blob */}
        <div style={{
          position: "absolute", right: -80, top: -80,
          width: 280, height: 280,
          background: `radial-gradient(circle, color-mix(in oklab, ${a.color}, transparent 72%) 0%, transparent 60%)`,
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", gap: 22, alignItems: "flex-start", position: "relative" }}>
          <AgentGlyph agent={agentId} size="xl" />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: a.color, letterSpacing: ".14em", textTransform: "uppercase" }}>
                {a.role} agent
              </span>
              <span className="zr-dot-divider" />
              <span className="zr-pill positive" style={{ fontSize: 10 }}>
                <span className="dot" />Active · learning your week
              </span>
            </div>
            <h1 className="zr-serif" style={{ fontSize: 48, lineHeight: 1.05, marginTop: 4 }}>{a.name}</h1>
            <p style={{ fontSize: 15, color: "var(--text-dim)", maxWidth: 600, marginTop: 6 }}>
              {a.blurb} {a.name} choreographs your life around your real capacity — making space for what matters, protecting energy you didn&apos;t know you were losing.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <span className="zr-pill">
              <span className="dot" style={{ background: "var(--accent)" }} />Autonomy · Co-pilot
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="zr-btn sm">Pause</button>
              <button className="zr-btn sm">Settings</button>
            </div>
          </div>
        </div>

        {/* Hero stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
          marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)",
        }}>
          <Stat label="Actions proposed · 30d" value="142" sub="+18% vs prior month" />
          <Stat label="Accepted" value="118" sub="83% acceptance" />
          <Stat label="Time reclaimed" value="6h 24m" sub="this week" color={a.color} />
          <Stat label="Reliability" value="0.94" sub="confidence calibration" />
        </div>
      </div>

      {/* ── What I'm watching + Recent actions ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Watching */}
        <div className="zr-card">
          <div className="zr-card-head">
            <span className="zr-card-title">What I&apos;m watching</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {AGENT_DETAIL.watching.map((w, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: "10px 0",
                  borderTop: i ? "1px solid var(--border)" : "none",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>{w.l}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-dim)" }} className="zr-mono">{w.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent actions */}
        <div className="zr-card">
          <div className="zr-card-head">
            <span className="zr-card-title">Recent actions</span>
            <span className="zr-card-action">
              All 142 ·{" "}
              <span style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>{I.arrow}</span>
            </span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {AGENT_DETAIL.recent.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: "10px 0",
                  borderTop: i ? "1px solid var(--border)" : "none",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 11, color: "var(--text-mute)", minWidth: 80 }} className="zr-mono">{row.t}</span>
                <span style={{
                  fontSize: 11,
                  padding: "1px 7px",
                  borderRadius: 999,
                  minWidth: 78,
                  textAlign: "center",
                  flexShrink: 0,
                  ...actionBadgeStyle(row.state),
                }}>
                  {row.a}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>{row.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── House rules + Coordinates with + Confidence ───────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {/* House rules */}
        <div className="zr-card">
          <div className="zr-card-head">
            <span className="zr-card-title">House rules</span>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {AGENT_DETAIL.rules.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--text-2)" }}>{r}</span>
                <span style={{ marginLeft: "auto", color: "var(--text-faint)", display: "grid", placeItems: "center", width: 14, height: 14 }}>{I.edit}</span>
              </div>
            ))}
            <button className="zr-btn sm" style={{ alignSelf: "flex-start", marginTop: 4 }}>
              <span style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>{I.plus}</span>
              Add a rule
            </button>
          </div>
        </div>

        {/* Coordinates with */}
        <div className="zr-card">
          <div className="zr-card-head">
            <span className="zr-card-title">Coordinates with</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {AGENT_DETAIL.coordinates.map((c, i) => {
              const ag = AGENTS[c.id];
              return (
                <Link key={i} href={`/agents/${c.id}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AgentGlyph agent={c.id} />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text)" }}>{ag.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{c.l}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Confidence over time */}
        <div className="zr-card">
          <div className="zr-card-head">
            <span className="zr-card-title">Confidence over time</span>
          </div>
          <MiniSpark color={a.color} values={AGENT_DETAIL.confidence} h={80} />
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 10 }}>
            {a.name} is learning your week — last month&apos;s drift between predicted and ideal start times closed by{" "}
            <b style={{ color: "var(--text)" }}>27%</b>.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="zr-btn sm">
              <span style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>{I.spark}</span>
              Calibrate
            </button>
            <button className="zr-btn ghost sm">Forget last week</button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// Generate static params for all known agents (optional optimization)
export function generateStaticParams() {
  return AGENT_LIST.map((a) => ({ id: a.id }));
}
