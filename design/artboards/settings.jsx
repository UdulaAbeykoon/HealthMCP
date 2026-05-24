// Zenra — Profile + Settings

function Section({ title, sub, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 32, padding: "24px 0", borderTop: "1px solid var(--border)" }}>
      <div>
        <h3 className="zr-serif" style={{ fontSize: 22, marginBottom: 4 }}>{title}</h3>
        <p style={{ fontSize: 12, color: "var(--text-mute)", maxWidth: 220 }}>{sub}</p>
      </div>
      <div style={{ display: "grid", gap: 14 }}>{children}</div>
    </div>
  );
}

function ToggleRow({ label, sub, on }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "var(--text)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>{sub}</div>}
      </div>
      <span style={{
        width: 36, height: 20, borderRadius: 999,
        background: on ? "var(--accent)" : "var(--surface-elev)",
        border: `1px solid ${on ? "transparent" : "var(--border-strong)"}`,
        position: "relative",
      }}>
        <span style={{
          position: "absolute", top: 1, left: on ? 17 : 1,
          width: 16, height: 16, borderRadius: "50%",
          background: on ? "#1a1208" : "var(--text-dim)",
          transition: "left .15s",
        }}/>
      </span>
    </div>
  );
}

function SettingsArtboard() {
  return (
    <Shell active="settings" crumbs={["Settings"]}>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32 }}>
        {/* secondary nav */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            ["Profile", true], ["Autonomy", false], ["Agents", false], ["Notifications", false],
            ["Data & privacy", false], ["Appearance", false], ["Plan & billing", false],
          ].map(([n, on], i) => (
            <div key={i} className={"zr-nav" + (on ? " is-active" : "")}>
              <span>{n}</span>
            </div>
          ))}
        </aside>

        {/* main */}
        <div>
          <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <div className="zr-eyebrow" style={{ marginBottom: 8 }}>Profile · settings</div>
              <h1 className="zr-serif" style={{ fontSize: 36, lineHeight: 1.1 }}>
                Elena Marsh.
              </h1>
              <p style={{ color: "var(--text-dim)", marginTop: 4 }}>
                Zenra member since Mar 2026 · timezone Europe/Lisbon
              </p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="zr-btn">Sign out</button>
              <button className="zr-btn primary">Save changes</button>
            </div>
          </div>

          <Section title="You" sub="The basics. We never share this with agents — they only see derived signals.">
            <div className="zr-card" style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr", gap: 18, alignItems: "center" }}>
              <div className="zr-avatar" style={{ width: 56, height: 56, fontSize: 18, borderRadius: 14 }}>EM</div>
              <div>
                <div className="zr-eyebrow">Display name</div>
                <input className="zr-input" defaultValue="Elena Marsh"/>
              </div>
              <div>
                <div className="zr-eyebrow">Pronouns</div>
                <input className="zr-input" defaultValue="she / her"/>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Input label="Email" value="elena@marsh.studio"/>
              <Input label="Birth year" value="1991"/>
              <Input label="Sex assigned at birth" value="Female"/>
            </div>
          </Section>

          <Section title="Autonomy" sub="How much we do for you. Per-agent overrides apply.">
            <div className="zr-card">
              <div className="zr-eyebrow" style={{ marginBottom: 10 }}>Default level</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  ["Observe", "Watch only"],
                  ["Co-pilot", "Propose, you decide", true],
                  ["Trusted", "Auto-handle low-stakes"],
                  ["Autopilot", "Coordinate everything"],
                ].map(([t, d, on], i) => (
                  <div key={i} className="zr-card" style={{
                    padding: 12,
                    background: on ? "var(--accent-soft)" : "var(--surface)",
                    borderColor: on ? "var(--accent)" : "var(--border)",
                    cursor: "pointer",
                  }}>
                    <div style={{ fontSize: 13, color: on ? "var(--accent)" : "var(--text)" }}>{t}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{d}</div>
                  </div>
                ))}
              </div>
              <div className="zr-divider"></div>
              <ToggleRow label="Always ask before moving meetings with my manager" sub="Marcus Hill" on={true}/>
              <ToggleRow label="Auto-execute reversible nudges (lights, playlists)" on={true}/>
              <ToggleRow label="Daily summary at 21:30" on={true}/>
              <ToggleRow label="Wake me with weekly insight on Sundays" sub="from Sage" on={false}/>
            </div>
          </Section>

          <Section title="Agents" sub="Turn agents on or off, or change tone per agent.">
            <div className="zr-card flush">
              {Object.values(AGENTS).map((a, i) => (
                <div key={a.id} style={{
                  display: "grid", gridTemplateColumns: "44px 1fr 160px 100px 80px",
                  gap: 14, alignItems: "center",
                  padding: "14px 18px",
                  borderTop: i ? "1px solid var(--border)" : "none",
                }}>
                  <AgentGlyph agent={a.id}/>
                  <div>
                    <div style={{ fontSize: 13 }}>{a.name} <span style={{ color: "var(--text-mute)" }}>· {a.role}</span></div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{a.blurb}</div>
                  </div>
                  <select className="zr-input" style={{ padding: "6px 10px", fontSize: 12 }} defaultValue="copilot">
                    <option value="observe">Observe only</option>
                    <option value="copilot">Co-pilot</option>
                    <option value="trusted">Trusted autopilot</option>
                    <option value="full">Full autopilot</option>
                  </select>
                  <select className="zr-input" style={{ padding: "6px 10px", fontSize: 12 }} defaultValue="warm">
                    <option value="warm">Warm</option>
                    <option value="brief">Concise</option>
                    <option value="coach">Coach</option>
                  </select>
                  <ToggleRow on={a.id !== "iris" || true}/>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Notifications" sub="When and how we interrupt.">
            <div className="zr-card">
              <ToggleRow label="Push" sub="Time-sensitive proposals only" on={true}/>
              <ToggleRow label="Email digest · 06:30" on={true}/>
              <ToggleRow label="Slack DM (low-priority nudges)" on={false}/>
              <ToggleRow label="Apple Watch complication" on={true}/>
              <div className="zr-divider"></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input label="Quiet hours start" value="21:00"/>
                <Input label="Quiet hours end"   value="06:30"/>
              </div>
            </div>
          </Section>

          <Section title="Data &amp; privacy" sub="Your data is yours. Audit anything.">
            <div className="zr-card">
              <ToggleRow label="Store raw signals on-device when possible" on={true}/>
              <ToggleRow label="Allow anonymized model improvement" on={false}/>
              <ToggleRow label="Share reflections with research" sub="One-time opt-in per study" on={false}/>
              <div className="zr-divider"></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="zr-btn">Download all my data</button>
                <button className="zr-btn">Open audit log</button>
                <button className="zr-btn danger" style={{ marginLeft: "auto" }}>Delete account</button>
              </div>
            </div>
          </Section>

          <Section title="Disclaimer" sub="Not medical advice. Designed to help, not diagnose.">
            <div className="zr-card" style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6,
            }}>
              Zenra is a personal coordination tool. It is not a medical device and does not provide diagnosis,
              treatment or medical advice. If you experience symptoms that worry you, talk to a licensed
              clinician. Agents may be wrong; treat every proposal as a starting point, not a verdict.
            </div>
          </Section>
        </div>
      </div>
    </Shell>
  );
}

function Input({ label, value }) {
  return (
    <div>
      <div className="zr-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <input className="zr-input" defaultValue={value}/>
    </div>
  );
}

Object.assign(window, { SettingsArtboard });
