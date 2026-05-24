"use client";

import { useState, type ReactNode } from "react";
import { Shell } from "@/components/Shell";
import { AgentGlyph } from "@/components/AgentGlyph";
import { I } from "@/components/Icons";
import { AGENT_LIST, AGENTS, type AgentId } from "@/lib/agents";
import { USER } from "@/lib/seed";

// ── Toggle switch (interactive) ──────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={"zr-toggle" + (on ? " on" : "")}
      onClick={() => onChange(!on)}
      aria-pressed={on}
      type="button"
    >
      <span className="knob" />
    </button>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────
function ToggleRow({
  label,
  sub,
  on,
  onChange,
}: {
  label?: string;
  sub?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0" }}>
      <div style={{ flex: 1 }}>
        {label && <div style={{ fontSize: 13, color: "var(--text)" }}>{label}</div>}
        {sub && <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>{sub}</div>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

// ── Labeled input ─────────────────────────────────────────────────────
function LabeledInput({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <div className="zr-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <input className="zr-input" defaultValue={defaultValue} />
    </div>
  );
}

// ── Section layout ────────────────────────────────────────────────────
function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        gap: 32,
        padding: "28px 0",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div>
        <h3 className="zr-serif" style={{ fontSize: 22, marginBottom: 6 }}>
          {title}
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-mute)", maxWidth: 210, lineHeight: 1.55 }}>
          {sub}
        </p>
      </div>
      <div style={{ display: "grid", gap: 14 }}>{children}</div>
    </div>
  );
}

// ── Autonomy level card ───────────────────────────────────────────────
const AUTONOMY_LEVELS = [
  { id: "observe", t: "Observe", d: "Watch only" },
  { id: "copilot", t: "Co-pilot", d: "Propose, you decide" },
  { id: "trusted", t: "Trusted", d: "Auto low-stakes" },
  { id: "full",    t: "Autopilot", d: "Coordinate all" },
] as const;

// ── Main Settings page ────────────────────────────────────────────────
export default function SettingsPage() {
  // Autonomy
  const [autonomyLevel, setAutonomyLevel] = useState<string>("copilot");

  // Autonomy toggles
  const [askManager, setAskManager] = useState(true);
  const [autoReversible, setAutoReversible] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [weeklyInsight, setWeeklyInsight] = useState(false);

  // Agent on/off states (keyed by id)
  const [agentOn, setAgentOn] = useState<Record<AgentId, boolean>>({
    sage: true, lyra: true, atlas: true, orchid: true, echo: true, fern: true, iris: true,
  });

  // Notification toggles
  const [push, setPush] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [slackDm, setSlackDm] = useState(false);
  const [watchComp, setWatchComp] = useState(true);

  // Privacy toggles
  const [localFirst, setLocalFirst] = useState(true);
  const [anonModel, setAnonModel] = useState(false);
  const [shareResearch, setShareResearch] = useState(false);

  return (
    <Shell
      topRight={
        <div style={{ display: "flex", gap: 8 }}>
          <button className="zr-btn">Sign out</button>
          <button className="zr-btn primary">Save changes</button>
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "192px 1fr", gap: 36 }}>
        {/* ── Secondary nav ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            ["Profile", true],
            ["Autonomy", false],
            ["Agents", false],
            ["Notifications", false],
            ["Data & privacy", false],
            ["Appearance", false],
            ["Plan & billing", false],
          ].map(([n, on]) => (
            <div key={n as string} className={"zr-nav" + (on ? " is-active" : "")}>
              <span>{n}</span>
            </div>
          ))}
        </aside>

        {/* ── Main column ── */}
        <div>
          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 8 }}>
            <div>
              <div className="zr-eyebrow" style={{ marginBottom: 8 }}>Profile · settings</div>
              <h1 className="zr-serif" style={{ fontSize: 36, lineHeight: 1.1 }}>
                Elena Marsh.
              </h1>
              <p style={{ color: "var(--text-dim)", marginTop: 6, fontSize: 14 }}>
                Zenra member since {USER.memberSince} · timezone {USER.timezone}
              </p>
            </div>
          </div>

          {/* ── You ── */}
          <Section
            title="You"
            sub="The basics. We never share this with agents — they only see derived signals."
          >
            <div
              className="zr-card"
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 1fr",
                gap: 18,
                alignItems: "center",
              }}
            >
              <div
                className="zr-avatar"
                style={{ width: 56, height: 56, fontSize: 18, borderRadius: 14 }}
              >
                EM
              </div>
              <div>
                <div className="zr-eyebrow" style={{ marginBottom: 6 }}>Display name</div>
                <input className="zr-input" defaultValue={USER.fullName} />
              </div>
              <div>
                <div className="zr-eyebrow" style={{ marginBottom: 6 }}>Pronouns</div>
                <input className="zr-input" defaultValue={USER.pronouns} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <LabeledInput label="Email" defaultValue={USER.email} />
              <LabeledInput label="Birth year" defaultValue="1991" />
              <LabeledInput label="Sex assigned at birth" defaultValue="Female" />
            </div>
          </Section>

          {/* ── Autonomy ── */}
          <Section
            title="Autonomy"
            sub="How much we do for you. Per-agent overrides apply."
          >
            <div className="zr-card">
              <div className="zr-eyebrow" style={{ marginBottom: 10 }}>Default level</div>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}
              >
                {AUTONOMY_LEVELS.map((l) => {
                  const active = autonomyLevel === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setAutonomyLevel(l.id)}
                      className="zr-card"
                      style={{
                        padding: 12,
                        background: active ? "var(--accent-soft)" : "var(--surface)",
                        borderColor: active ? "var(--accent)" : "var(--border)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background .15s, border-color .15s",
                      }}
                    >
                      <div style={{ fontSize: 13, color: active ? "var(--accent)" : "var(--text)" }}>
                        {l.t}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                        {l.d}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="zr-divider" />

              <ToggleRow
                label="Always ask before moving meetings with my manager"
                sub="Marcus Hill"
                on={askManager}
                onChange={setAskManager}
              />
              <ToggleRow
                label="Auto-execute reversible nudges (lights, playlists)"
                on={autoReversible}
                onChange={setAutoReversible}
              />
              <ToggleRow
                label="Daily summary at 21:30"
                on={dailySummary}
                onChange={setDailySummary}
              />
              <ToggleRow
                label="Wake me with weekly insight on Sundays"
                sub="from Sage"
                on={weeklyInsight}
                onChange={setWeeklyInsight}
              />
            </div>
          </Section>

          {/* ── Agents ── */}
          <Section
            title="Agents"
            sub="Turn agents on or off, or change tone per agent."
          >
            <div className="zr-card flush">
              {AGENT_LIST.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px 1fr 160px 100px 56px",
                    gap: 14,
                    alignItems: "center",
                    padding: "14px 18px",
                    borderTop: i ? "1px solid var(--border)" : "none",
                  }}
                >
                  <AgentGlyph agent={a.id} />
                  <div>
                    <div style={{ fontSize: 13 }}>
                      {a.name}{" "}
                      <span style={{ color: "var(--text-mute)" }}>· {a.role}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>
                      {a.blurb}
                    </div>
                  </div>
                  <select
                    className="zr-input"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    defaultValue="copilot"
                  >
                    <option value="observe">Observe only</option>
                    <option value="copilot">Co-pilot</option>
                    <option value="trusted">Trusted autopilot</option>
                    <option value="full">Full autopilot</option>
                  </select>
                  <select
                    className="zr-input"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    defaultValue="warm"
                  >
                    <option value="warm">Warm</option>
                    <option value="brief">Concise</option>
                    <option value="coach">Coach</option>
                  </select>
                  <Toggle
                    on={agentOn[a.id]}
                    onChange={(v) =>
                      setAgentOn((prev) => ({ ...prev, [a.id]: v }))
                    }
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* ── Notifications ── */}
          <Section title="Notifications" sub="When and how we interrupt.">
            <div className="zr-card">
              <ToggleRow
                label="Push"
                sub="Time-sensitive proposals only"
                on={push}
                onChange={setPush}
              />
              <ToggleRow
                label="Email digest · 06:30"
                on={emailDigest}
                onChange={setEmailDigest}
              />
              <ToggleRow
                label="Slack DM (low-priority nudges)"
                on={slackDm}
                onChange={setSlackDm}
              />
              <ToggleRow
                label="Apple Watch complication"
                on={watchComp}
                onChange={setWatchComp}
              />
              <div className="zr-divider" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <LabeledInput label="Quiet hours start" defaultValue="21:00" />
                <LabeledInput label="Quiet hours end" defaultValue="06:30" />
              </div>
            </div>
          </Section>

          {/* ── Data & privacy ── */}
          <Section title="Data & privacy" sub="Your data is yours. Audit anything.">
            <div className="zr-card">
              <ToggleRow
                label="Store raw signals on-device when possible"
                on={localFirst}
                onChange={setLocalFirst}
              />
              <ToggleRow
                label="Allow anonymized model improvement"
                on={anonModel}
                onChange={setAnonModel}
              />
              <ToggleRow
                label="Share reflections with research"
                sub="One-time opt-in per study"
                on={shareResearch}
                onChange={setShareResearch}
              />
              <div className="zr-divider" />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="zr-btn">Download all my data</button>
                <button className="zr-btn">Open audit log</button>
                <button
                  className="zr-btn danger"
                  style={{ marginLeft: "auto" }}
                >
                  Delete account
                </button>
              </div>
            </div>
          </Section>

          {/* ── Disclaimer ── */}
          <Section
            title="Disclaimer"
            sub="Not medical advice. Designed to help, not diagnose."
          >
            <div
              className="zr-card"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                fontSize: 12,
                color: "var(--text-dim)",
                lineHeight: 1.7,
              }}
            >
              Zenra is a personal coordination tool. It is not a medical device and does not
              provide diagnosis, treatment or medical advice. If you experience symptoms that
              worry you, talk to a licensed clinician. Agents may be wrong; treat every
              proposal as a starting point, not a verdict.
            </div>
          </Section>
        </div>
      </div>
    </Shell>
  );
}
