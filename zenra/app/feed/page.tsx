"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { AgentGlyph } from "@/components/AgentGlyph";
import { I } from "@/components/Icons";
import { Pill } from "@/components/charts";
import { AGENTS } from "@/lib/agents";
import { useProposals } from "@/lib/client";
import type { Proposal } from "@/lib/types";
import { AnimatedNumber, Reveal } from "@/components/anim";

/* ─── Spinner SVG (used inline) ─────────────────────────────────── */
function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg
      className="zr-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

/* ─── Resolved row (card collapsed after action) ────────────────── */
function ResolvedRow({
  p,
  execResult,
  live,
  status,
}: {
  p: Proposal;
  execResult?: string;
  live?: boolean;
  status: "accepted" | "dismissed" | "snoozed";
}) {
  const a = AGENTS[p.agent];
  const iconMap = {
    accepted: I.check,
    dismissed: I.x,
    snoozed: I.snooze,
  };
  const colorMap = {
    accepted: "var(--positive)",
    dismissed: "var(--text-mute)",
    snoozed: "var(--warn)",
  };
  return (
    <div
      className="zr-fade-in"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 18px",
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        opacity: 0.72,
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background:
            status === "accepted"
              ? "rgba(52,160,133,.12)"
              : status === "snoozed"
              ? "rgba(216,154,76,.12)"
              : "color-mix(in oklab, var(--text), transparent 90%)",
          color: colorMap[status],
          flexShrink: 0,
        }}
      >
        <span style={{ width: 13, height: 13, display: "grid", placeItems: "center" }}>
          {iconMap[status]}
        </span>
      </span>

      <AgentGlyph agent={p.agent} size="md" />

      <span style={{ fontSize: 12, color: "var(--text-dim)", flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 500, color: "var(--text-2)" }}>{a.name}</span>
        {" · "}
        {execResult
          ? execResult
          : status === "dismissed"
          ? "Dismissed"
          : status === "snoozed"
          ? "Snoozed — I'll remind you later"
          : p.title}
      </span>

      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        {status === "accepted" && live && (
          <span className="zr-pill positive" style={{ fontSize: 10, padding: "3px 8px" }}>
            <span className="dot" />
            Live
          </span>
        )}
        {status === "accepted" && !live && (
          <span style={{ fontSize: 10, color: "var(--text-mute)" }}>simulated</span>
        )}
      </div>
    </div>
  );
}

/* ─── Individual proposal card ───────────────────────────────────── */
interface CardState {
  busy: boolean;
  showWhy: boolean;
  resolved: null | { status: "accepted" | "dismissed" | "snoozed"; execResult?: string; live?: boolean };
}

function ProposalCard({
  p,
  act,
}: {
  p: Proposal;
  act: (id: string, action: string) => Promise<{ proposal: Proposal; exec?: { ok: boolean; result?: string; live?: boolean } }>;
}) {
  const a = AGENTS[p.agent];
  const [state, setState] = useState<CardState>({ busy: false, showWhy: false, resolved: null });

  // If already resolved from server, show resolved immediately
  const serverResolved = p.status !== "pending" ? p.status : null;

  const doAction = useCallback(
    async (action: "accept" | "dismiss" | "snooze") => {
      setState((s) => ({ ...s, busy: true }));
      try {
        const res = await act(p.id, action);
        const execResult = res.exec?.result;
        const live = res.exec?.live;
        const mapped = action === "accept" ? "accepted" : action === "dismiss" ? "dismissed" : "snoozed";
        setState({ busy: false, showWhy: false, resolved: { status: mapped, execResult, live } });
      } catch {
        setState((s) => ({ ...s, busy: false }));
      }
    },
    [act, p.id]
  );

  const toggleWhy = useCallback(() => {
    setState((s) => ({ ...s, showWhy: !s.showWhy }));
  }, []);

  // If server already resolved this card and we haven't locally resolved it
  if (serverResolved && !state.resolved) {
    return (
      <ResolvedRow
        p={p}
        execResult={p.result}
        live={false}
        status={serverResolved as "accepted" | "dismissed" | "snoozed"}
      />
    );
  }

  if (state.resolved) {
    return (
      <ResolvedRow
        p={p}
        execResult={state.resolved.execResult}
        live={state.resolved.live}
        status={state.resolved.status}
      />
    );
  }

  return (
    <div className="zr-card zr-fade-in zr-lift" style={{ padding: 22 }}>
      <div style={{ display: "flex", gap: 16 }}>
        <AgentGlyph agent={p.agent} size="lg" />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              {a.name} · {a.role}
            </span>
            <span className="zr-dot-divider" />
            <span className="zr-mono" style={{ fontSize: 11, color: "var(--text-mute)" }}>
              {p.time}
            </span>
            {p.urgent && (
              <span className="zr-pill accent" style={{ fontSize: 10, padding: "3px 8px" }}>
                Time-sensitive
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className="zr-serif"
            style={{ fontSize: 22, lineHeight: 1.32, marginBottom: 12, maxWidth: 680, color: "var(--text)" }}
          >
            {p.title}
          </h3>

          {/* Why? panel */}
          {state.showWhy && p.why && (
            <div
              className="zr-fade-in"
              style={{
                marginBottom: 14,
                padding: "10px 14px",
                borderRadius: 12,
                background: "var(--accent-soft)",
                border: "1px solid var(--accent-soft-2)",
                fontSize: 13,
                color: "var(--text-2)",
                lineHeight: 1.55,
              }}
            >
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: 14,
                  height: 14,
                  color: "var(--accent)",
                  marginRight: 6,
                  verticalAlign: "middle",
                }}
              >
                {I.info}
              </span>
              {p.why}
            </div>
          )}

          {/* Signal pills */}
          {p.signals && p.signals.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {p.signals.map((s, i) => (
                <span key={i} className="zr-pill ghost" style={{ fontSize: 11 }}>
                  <span
                    className="dot"
                    style={{ background: s.color || a.color }}
                  />
                  {s.text}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="zr-btn primary sm zr-press"
              disabled={state.busy}
              onClick={() => doAction("accept")}
              style={{ gap: 6 }}
            >
              {state.busy ? <Spinner size={12} /> : null}
              {p.approveLabel || "Approve"}
            </button>

            <button
              className="zr-btn ghost sm zr-press"
              disabled={state.busy}
              onClick={() => doAction("snooze")}
              style={{ color: "var(--text-dim)" }}
            >
              Snooze
            </button>

            <button
              className="zr-btn ghost sm zr-press"
              onClick={toggleWhy}
              style={{ color: state.showWhy ? "var(--accent)" : "var(--text-dim)" }}
            >
              Why?
            </button>

            <button
              className="zr-btn ghost icon sm zr-press"
              disabled={state.busy}
              onClick={() => doAction("dismiss")}
              aria-label="Dismiss"
              style={{ marginLeft: "auto", color: "var(--text-mute)" }}
            >
              <span style={{ width: 14, height: 14, display: "grid", placeItems: "center" }}>{I.x}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Group header ───────────────────────────────────────────────── */
function GroupHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div
      style={{
        padding: "20px 4px 10px",
        display: "flex",
        alignItems: "baseline",
        gap: 12,
      }}
    >
      <h3 className="zr-serif" style={{ fontSize: 20, color: "var(--text)" }}>
        {label}
      </h3>
      {sub && (
        <span style={{ fontSize: 12, color: "var(--text-mute)", marginLeft: "auto" }}>{sub}</span>
      )}
    </div>
  );
}

/* ─── Bucket config ──────────────────────────────────────────────── */
const BUCKET_META: Record<string, { label: string; sub: string }> = {
  now: { label: "Now", sub: "Decide before things move on" },
  morning: { label: "This morning", sub: "Routine — review when convenient" },
  later: { label: "Later today", sub: "No rush" },
};
const BUCKET_ORDER = ["now", "morning", "later"] as const;

/* ─── Huddle button ──────────────────────────────────────────────── */
function HuddleButton({ orchestrate }: { orchestrate: (focus?: string) => Promise<void> }) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await orchestrate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className="zr-btn primary sm zr-press"
      disabled={busy}
      onClick={run}
      style={{ gap: 8, whiteSpace: "nowrap" }}
    >
      {busy ? (
        <>
          <Spinner size={12} />
          Your agents are huddling…
        </>
      ) : (
        <>
          <span style={{ width: 14, height: 14, display: "inline-grid", placeItems: "center" }}>
            {I.spark}
          </span>
          Run the morning huddle
        </>
      )}
    </button>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function FeedPage() {
  const { proposals, loading, act, orchestrate } = useProposals();

  // Compute summary numbers from pending proposals
  const pending = proposals.filter((p) => p.status === "pending");
  const agentCount = new Set(pending.map((p) => p.agent)).size;

  // Group all proposals by bucket (show resolved ones too so cards can collapse)
  const grouped: Record<string, Proposal[]> = {};
  for (const p of proposals) {
    if (!grouped[p.bucket]) grouped[p.bucket] = [];
    grouped[p.bucket].push(p);
  }

  const topRight = <HuddleButton orchestrate={orchestrate} />;

  return (
    <Shell topRight={topRight}>
      <div style={{ maxWidth: 880, marginInline: "auto" }}>

        {/* ── Page header ────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div className="zr-eyebrow" style={{ marginBottom: 6 }}>
            {loading ? "Loading…" : (
            <>
              <AnimatedNumber value={pending.length} />{" proposal"}{pending.length !== 1 ? "s" : ""}{" · "}
              <AnimatedNumber value={agentCount} />{" agent"}{agentCount !== 1 ? "s" : ""}{" · Today"}
            </>
          )}
          </div>
          <h1
            className="zr-serif"
            style={{ fontSize: 34, lineHeight: 1.12, color: "var(--text)" }}
          >
            What your team is proposing for&nbsp;you today.
          </h1>
        </div>

        {/* ── Loading skeleton ───────────────────────────────── */}
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "var(--text-mute)",
              fontSize: 13,
              padding: "40px 0",
            }}
          >
            <Spinner size={16} />
            Gathering proposals…
          </div>
        )}

        {/* ── Buckets ────────────────────────────────────────── */}
        {!loading &&
          BUCKET_ORDER.map((bucket) => {
            const items = grouped[bucket];
            if (!items || items.length === 0) return null;

            // Only show group if there's at least one pending item
            const hasPending = items.some((p) => p.status === "pending");
            if (!hasPending) return null;

            const meta = BUCKET_META[bucket];
            return (
              <div key={bucket}>
                <GroupHeader label={meta.label} sub={meta.sub} />
                <div style={{ display: "grid", gap: 12 }}>
                  {items.map((p, index) => (
                    <Reveal key={p.id} delay={index * 70}>
                      <ProposalCard
                        p={p}
                        act={act as (id: string, action: string) => Promise<{ proposal: Proposal; exec?: { ok: boolean; result?: string; live?: boolean } }>}
                      />
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })}

        {/* ── Empty / footer ─────────────────────────────────── */}
        {!loading && (
          <div
            style={{
              marginTop: 44,
              padding: "28px 24px",
              textAlign: "center",
              borderRadius: 18,
              border: "1px dashed var(--border-strong)",
              color: "var(--text-dim)",
            }}
          >
            <div style={{ fontSize: 14 }}>That's everything for now.</div>
            <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 4 }}>
              I'll keep watching — and only interrupt if it matters.
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
