// Zenra — Onboarding (multi-step). Single artboard showing one rich step + step thumbnails.

function OnboardingFrame({ active = 2, children }) {
  const steps = [
    { i: 1, label: "Hello" },
    { i: 2, label: "Your goals" },
    { i: 3, label: "Your rhythm" },
    { i: 4, label: "Autonomy" },
    { i: 5, label: "Connect" },
    { i: 6, label: "Promise" },
  ];
  return (
    <div className="zr zr-app" style={{ gridTemplateColumns: "1fr", background: "var(--bg-grad)" }}>
      <div style={{ minHeight: "100%", display: "grid", gridTemplateColumns: "1fr 720px 1fr", padding: "32px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="zr-brand">
            <div className="zr-brand-mark"></div>
            <div>
              <div className="zr-brand-name">Zenra</div>
              <div className="zr-brand-sub">Health OS</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-mute)" }}>
            <div style={{ marginBottom: 6, letterSpacing: ".14em", textTransform: "uppercase" }}>Step {active} of 6</div>
            {steps.map(s => (
              <div key={s.i} style={{
                padding: "5px 0",
                color: s.i === active ? "var(--text)" : s.i < active ? "var(--text-dim)" : "var(--text-mute)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: `1px solid ${s.i <= active ? "var(--accent)" : "var(--border-strong)"}`,
                  background: s.i < active ? "var(--accent)" : "transparent",
                  color: "#1a1208",
                  display: "grid", placeItems: "center",
                  fontSize: 9,
                }}>{s.i < active ? "✓" : s.i === active ? "" : ""}</span>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: 24 }}>
          {children}
        </div>

        <div></div>
      </div>
    </div>
  );
}

function OnboardingArtboard() {
  // Show the 4th step (Autonomy) as the hero step.
  return (
    <OnboardingFrame active={4}>
      <div className="zr-eyebrow" style={{ marginBottom: 12 }}>Autonomy</div>
      <h1 className="zr-serif" style={{ fontSize: 44, lineHeight: 1.05, maxWidth: 600, marginBottom: 14 }}>
        How much should we <em style={{ fontStyle: "italic", color: "var(--accent)" }}>do</em> on your behalf?
      </h1>
      <p style={{ color: "var(--text-dim)", fontSize: 15, maxWidth: 540, marginBottom: 28 }}>
        You can change this any time — and override per-agent. We default to <b style={{ color: "var(--text)" }}>Co-pilot</b>:
        we propose, you decide.
      </p>

      <div style={{ display: "grid", gap: 10, maxWidth: 720, marginBottom: 28 }}>
        {[
          { id: "observe", t: "Observe only", d: "Watch and tell me what's happening. I'll act.", ex: "Daily summary, no nudges." },
          { id: "copilot", t: "Co-pilot", d: "Propose actions and wait for me. Default for new agents.", ex: "“Want me to push your 9am?”", picked: true },
          { id: "auto",    t: "Trusted autopilot", d: "Auto-handle reversible, low-stakes actions. Tell me what you did.", ex: "Auto-rescheduled internal sync." },
          { id: "max",     t: "Full autopilot", d: "Coordinate everything within my rules. Interrupt only on emergencies.", ex: "Whole-day choreography." },
        ].map(o => (
          <div key={o.id} className={"zr-card"} style={{
            padding: 16,
            borderColor: o.picked ? "var(--accent)" : "var(--border)",
            background: o.picked ? "linear-gradient(160deg, var(--accent-soft), transparent 80%), var(--surface-2)" : "var(--surface-2)",
            display: "flex", alignItems: "flex-start", gap: 14,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: "50%",
              border: `1.5px solid ${o.picked ? "var(--accent)" : "var(--border-strong)"}`,
              background: o.picked ? "var(--accent)" : "transparent",
              marginTop: 4,
              flex: "0 0 auto",
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 16, color: "var(--text)" }}>{o.t}</span>
                {o.picked && <span className="zr-pill accent" style={{ fontSize: 10 }}>Recommended</span>}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>{o.d}</div>
              <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 6, fontFamily: "JetBrains Mono" }}>
                e.g. {o.ex}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: 14, borderRadius: 10,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 12, marginBottom: 24, maxWidth: 720,
      }}>
        <span style={{ color: "var(--text-mute)" }}>{I.info}</span>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
          You'll see why every action is proposed. You can override per-agent in Settings.
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="zr-btn">Back</button>
        <button className="zr-btn primary">Continue → Connect data {I.chev}</button>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-mute)" }}>
          Press <span className="zr-kbd">↵</span> to continue
        </span>
      </div>

      {/* Other step previews as thumbnails */}
      <div style={{ marginTop: 64 }}>
        <div className="zr-eyebrow" style={{ marginBottom: 12 }}>The full flow · 6 steps</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <ThumbStep n="1" title="Hello, Elena.">
            <p className="zr-serif" style={{ fontSize: 18, lineHeight: 1.2 }}>I'm Zenra. I'll quietly arrange your day around how you actually feel.</p>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {["sage","lyra","atlas","orchid","echo","fern","iris"].map(id => (
                <span key={id} style={{
                  width: 22, height: 22, borderRadius: 7,
                  background: `color-mix(in oklab, ${AGENTS[id].color}, transparent 80%)`,
                  display: "grid", placeItems: "center", color: AGENTS[id].color,
                }}><span style={{ width: 12, height: 12 }}><GlyphSvg id={id}/></span></span>
              ))}
            </div>
          </ThumbStep>
          <ThumbStep n="2" title="What matters?">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[["Sleep deeper", true], ["Train consistently", true], ["Protect focus", true], ["Eat earlier", false], ["Less Slack anxiety", false], ["More energy by 3pm", true], ["Lower resting HR", false]].map(([t, on], i) => (
                <span key={i} className={"zr-pill" + (on ? " accent" : "")} style={{ fontSize: 11 }}>
                  {on && <span className="dot"></span>}{t}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 10 }}>Pick 3–5. We focus, not boil the ocean.</div>
          </ThumbStep>
          <ThumbStep n="3" title="Your rhythm">
            <div style={{ display: "grid", gap: 8, fontSize: 12, color: "var(--text-2)" }}>
              <Row k="Wake target" v="06:30"/>
              <Row k="Bedtime target" v="22:30"/>
              <Row k="Deep work" v="08:00 – 11:30"/>
              <Row k="Workout window" v="16:00 – 17:30"/>
              <Row k="Quiet hours" v="21:00 – 06:30"/>
            </div>
          </ThumbStep>
          <ThumbStep n="5" title="Connect data">
            <div style={{ display: "grid", gap: 6 }}>
              {[["Oura ring", true], ["Apple Health", true], ["Google Calendar", true], ["Slack", true], ["Strava", false]].map(([n, on], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: on ? "var(--positive)" : "var(--text-faint)" }}/>
                  <span style={{ color: on ? "var(--text)" : "var(--text-dim)" }}>{n}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-mute)" }}>{on ? "linked" : "skip"}</span>
                </div>
              ))}
            </div>
          </ThumbStep>
          <ThumbStep n="6" title="One promise">
            <p className="zr-serif" style={{ fontSize: 16, lineHeight: 1.3 }}>I won't replace your doctor, your gut or your weekend. I'll explain every nudge. You can mute me with one tap.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <span className="zr-pill"><span className="dot"></span>Not medical advice</span>
              <span className="zr-pill"><span className="dot"></span>Your data stays yours</span>
            </div>
          </ThumbStep>
          <ThumbStep n="✓" title="Ready" finished>
            <p className="zr-serif" style={{ fontSize: 18, lineHeight: 1.25 }}>Your agents are warming up. First proposal in ~24 hours.</p>
            <button className="zr-btn primary sm" style={{ marginTop: 14 }}>{I.arrow} Open Today</button>
          </ThumbStep>
        </div>
      </div>
    </OnboardingFrame>
  );
}

function ThumbStep({ n, title, finished, children }) {
  return (
    <div className="zr-card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span className="zr-pin" style={{
          background: finished ? "var(--positive)" : "var(--accent)",
        }}>{n}</span>
        <span style={{ fontSize: 13, color: "var(--text)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-dim)" }}>{k}</span>
      <span className="zr-mono">{v}</span>
    </div>
  );
}

Object.assign(window, { OnboardingArtboard });
