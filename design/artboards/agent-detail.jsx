// Zenra — Agent detail page (using Orchid, the calendar agent, as the example).

function AgentArtboard() {
  const id = "orchid";
  const a = AGENTS[id];
  return (
    <Shell active="cond" agentActive={id} crumbs={["Agents", a.name]}>
      {/* hero */}
      <div className="zr-card" style={{
        padding: 28,
        background: `linear-gradient(140deg, color-mix(in oklab, ${a.color}, transparent 88%), transparent 60%), var(--surface-2)`,
        borderColor: `color-mix(in oklab, ${a.color}, transparent 70%)`,
        marginBottom: 14,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: -80, top: -80,
          width: 280, height: 280,
          background: `radial-gradient(circle, color-mix(in oklab, ${a.color}, transparent 72%) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}/>
        <div style={{ display: "flex", gap: 22, alignItems: "flex-start", position: "relative" }}>
          <AgentGlyph agent={id} size="xl"/>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: a.color, letterSpacing: ".14em", textTransform: "uppercase" }}>{a.role} agent</span>
              <span className="zr-dot-divider"></span>
              <span className="zr-pill positive" style={{ fontSize: 10 }}>
                <span className="dot"></span>Active · learning your week
              </span>
            </div>
            <h1 className="zr-serif" style={{ fontSize: 48, lineHeight: 1.05, marginTop: 4 }}>{a.name}</h1>
            <p style={{ fontSize: 15, color: "var(--text-dim)", maxWidth: 600, marginTop: 6 }}>
              {a.blurb} Orchid choreographs your calendar around your real capacity — moving the right meetings,
              guarding focus blocks and earning back time you didn't notice you were losing.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <span className="zr-pill"><span className="dot" style={{ background: "var(--accent)" }}></span>Autonomy · Co-pilot</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="zr-btn sm">Pause</button>
              <button className="zr-btn sm">Settings</button>
            </div>
          </div>
        </div>

        {/* hero stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
          marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)",
        }}>
          <Stat label="Actions proposed · 30d" value="142" sub="+18% vs prior month"/>
          <Stat label="Accepted" value="118" sub="83% acceptance"/>
          <Stat label="Time reclaimed" value="6h 24m" sub="this week" color={a.color}/>
          <Stat label="Reliability" value="0.94" sub="confidence calibration"/>
        </div>
      </div>

      {/* What Orchid watches + What Orchid did */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="zr-card">
          <div className="zr-card-head">
            <span className="zr-card-title">What I'm watching</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { l: "Calendar density (next 72h)", v: "Heavy · 14 meetings" },
              { l: "Recurring drift",              v: "Wed standup +9 min" },
              { l: "Energy curve fit",             v: "Mismatched 2 days" },
              { l: "Quiet block respect",          v: "Held · 0 invasions" },
              { l: "Slack signals from Echo",      v: "12 messages held" },
            ].map((w, i) => (
              <div key={i} style={{ display: "flex", padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>{w.l}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-dim)" }} className="zr-mono">{w.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="zr-card">
          <div className="zr-card-head">
            <span className="zr-card-title">Recent actions</span>
            <span className="zr-card-action">All 142 · {I.arrow}</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { t: "9 min ago", a: "Proposed", l: "Push 9am sync to 10:30 — sleep light", state: "pending" },
              { t: "Today 06:34", a: "Moved", l: "Q-review held Friday 10am (high-energy slot)", state: "done" },
              { t: "Yesterday", a: "Declined", l: "User kept Tuesday's 7pm dinner meeting", state: "skipped" },
              { t: "Yesterday", a: "Auto-moved", l: "Internal sync 14:00 → 15:30 (focus block protected)", state: "auto" },
              { t: "Fri", a: "Coordinated", l: "Hold 30m solo block · with Echo", state: "done" },
              { t: "Thu", a: "Held", l: "Declined 'optional' company all-hands", state: "done" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none", gap: 12 }}>
                <span style={{ fontSize: 11, color: "var(--text-mute)", minWidth: 80 }} className="zr-mono">{row.t}</span>
                <span style={{
                  fontSize: 11,
                  padding: "1px 7px", borderRadius: 999,
                  background:
                    row.state === "pending" ? "var(--accent-soft)" :
                    row.state === "auto" ? "rgba(143,179,154,.14)" :
                    row.state === "skipped" ? "rgba(244,228,208,.06)" :
                    "rgba(143,179,154,.14)",
                  color:
                    row.state === "pending" ? "var(--accent)" :
                    row.state === "auto" || row.state === "done" ? "var(--positive)" :
                    "var(--text-dim)",
                  minWidth: 78, textAlign: "center",
                }}>{row.a}</span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>{row.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Knowledge / rules + signals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="zr-card">
          <div className="zr-card-head"><span className="zr-card-title">House rules</span></div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              "Never move 1:1s with my manager",
              "Protect 08:00–11:30 for deep work",
              "No meetings during workout window",
              "Last meeting ends by 17:30 Tue/Thu",
              "Friday afternoons stay open",
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "var(--surface)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }}/>
                <span style={{ fontSize: 12, color: "var(--text-2)" }}>{r}</span>
                <span style={{ marginLeft: "auto", color: "var(--text-faint)" }}>{I.edit}</span>
              </div>
            ))}
            <button className="zr-btn sm" style={{ alignSelf: "flex-start", marginTop: 4 }}>{I.plus} Add a rule</button>
          </div>
        </div>

        <div className="zr-card">
          <div className="zr-card-head"><span className="zr-card-title">Coordinates with</span></div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { id: "lyra",  l: "Push start times when sleep is short" },
              { id: "echo",  l: "Protect focus blocks · hold Slack pings" },
              { id: "atlas", l: "Block windows for training" },
              { id: "fern",  l: "Hold mealtime windows · earlier dinners" },
            ].map((c, i) => {
              const ag = AGENTS[c.id];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AgentGlyph agent={c.id}/>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text)" }}>{ag.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{c.l}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="zr-card">
          <div className="zr-card-head"><span className="zr-card-title">Confidence over time</span></div>
          <MiniSpark color={a.color} values={[.62,.66,.7,.74,.78,.82,.85,.88,.91,.92,.93,.94]} h={80}/>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 10 }}>
            Orchid is learning your week — last month's drift between predicted and ideal start times closed by <b style={{ color: "var(--text)" }}>27%</b>.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="zr-btn sm">{I.spark} Calibrate</button>
            <button className="zr-btn ghost sm">Forget last week</button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value, sub, color = "var(--text)" }) {
  return (
    <div>
      <div className="zr-eyebrow">{label}</div>
      <div className="zr-serif" style={{ fontSize: 34, lineHeight: 1.05, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

Object.assign(window, { AgentArtboard });
