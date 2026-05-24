// Zenra — Action Feed (simplified)

function ProposalCard({ p }) {
  const a = AGENTS[p.agent];
  return (
    <div className="zr-card" style={{ padding: 22 }}>
      <div style={{ display: "flex", gap: 16 }}>
        <AgentGlyph agent={p.agent} size="lg"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{a.name} · {a.role}</span>
            <span className="zr-dot-divider"></span>
            <span style={{ fontSize: 11, color: "var(--text-mute)" }} className="zr-mono">{p.time}</span>
            {p.urgent && <span className="zr-pill accent" style={{ fontSize: 10 }}>Time-sensitive</span>}
          </div>

          <h3 className="zr-serif" style={{ fontSize: 24, lineHeight: 1.3, marginBottom: 12, maxWidth: 680 }}>
            {p.title}
          </h3>

          {p.signals && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {p.signals.map((s, i) => (
                <span key={i} className="zr-pill ghost" style={{ fontSize: 11 }}>
                  <span className="dot" style={{ background: s.color || a.color }}></span>
                  {s.text}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button className="zr-btn primary sm">{p.approve || "Approve"}</button>
            <button className="zr-btn ghost sm" style={{ color: "var(--text-dim)" }}>Snooze</button>
            <button className="zr-btn ghost sm" style={{ color: "var(--text-dim)" }}>Why?</button>
            <button className="zr-btn ghost icon sm" style={{ marginLeft: "auto", color: "var(--text-mute)" }}>{I.x}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupHeader({ label, sub }) {
  return (
    <div style={{ padding: "18px 4px 10px", display: "flex", alignItems: "baseline", gap: 12 }}>
      <h3 className="zr-serif" style={{ fontSize: 22 }}>{label}</h3>
      <span style={{ fontSize: 12, color: "var(--text-mute)", marginLeft: "auto" }}>{sub}</span>
    </div>
  );
}

function ActionFeedArtboard() {
  return (
    <Shell active="feed">
      <div style={{ maxWidth: 880, marginInline: "auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div className="zr-eyebrow" style={{ marginBottom: 6 }}>5 proposals · 4 agents · Today</div>
          <h1 className="zr-serif" style={{ fontSize: 36, lineHeight: 1.1 }}>
            What we're proposing for you today.
          </h1>
        </div>

        <GroupHeader label="Now" sub="Decide before 10:30"/>
        <div style={{ display: "grid", gap: 12 }}>
          <ProposalCard p={{
            agent: "orchid", urgent: true, time: "2 min ago",
            title: "You slept light last night. Want me to push your 9am sync to 10:30?",
            signals: [
              { text: "Sleep efficiency 78%", color: "var(--ag-lyra)" },
              { text: "HRV −12% vs baseline", color: "var(--ag-sage)" },
              { text: "Internal sync · low stakes" },
            ],
            approve: "Approve & reschedule",
          }}/>
          <ProposalCard p={{
            agent: "echo", urgent: true, time: "8 min ago",
            title: "Slack is loud this morning. I can hold non-urgent pings until 11:30.",
            signals: [
              { text: "12 messages, 0 urgent" },
              { text: "Focus block in 4 min" },
            ],
            approve: "Hold pings",
          }}/>
        </div>

        <GroupHeader label="This morning" sub="Routine — review when convenient"/>
        <div style={{ display: "grid", gap: 12 }}>
          <ProposalCard p={{
            agent: "atlas", time: "18 min ago",
            title: "Zone 2 today instead of the planned intervals. Same hour, gentler load.",
            signals: [
              { text: "Recovery 62 (below 70)", color: "var(--ag-sage)" },
              { text: "Last 3 sessions were hard" },
            ],
            approve: "Swap to Z2",
          }}/>
          <ProposalCard p={{
            agent: "fern", time: "32 min ago",
            title: "Front-load protein at lunch — you're light on it for two days running.",
            signals: [
              { text: "Protein 78g / 140g (2-day avg)" },
              { text: "Workout planned 16:00" },
            ],
            approve: "Add to plan",
          }}/>
        </div>

        <GroupHeader label="Later today" sub="No rush"/>
        <div style={{ display: "grid", gap: 12 }}>
          <ProposalCard p={{
            agent: "lyra", time: "45 min ago",
            title: "Begin wind-down at 21:00 — earlier than usual. Small sleep debt.",
            signals: [
              { text: "Sleep debt: 1h 12m" },
              { text: "Target bedtime 22:30" },
            ],
            approve: "Set wind-down",
          }}/>
        </div>

        <div style={{
          marginTop: 40, padding: 28, textAlign: "center",
          borderRadius: 18, border: "1px dashed var(--border-strong)",
          color: "var(--text-dim)",
        }}>
          <div style={{ fontSize: 14 }}>That's everything for now.</div>
          <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 4 }}>
            I'll keep watching — and only interrupt if it matters.
          </div>
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { ActionFeedArtboard });
