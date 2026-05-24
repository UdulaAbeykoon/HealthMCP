// Zenra — Reflection / Evening check-in

function ReflectionArtboard() {
  return (
    <Shell active="reflect" agentActive="iris" crumbs={["Reflection · Sunday evening"]}>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
        {/* main check-in */}
        <div className="zr-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <AgentGlyph agent="iris" size="lg"/>
            <div>
              <div className="zr-eyebrow">Iris · Reflection</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>9:34 pm · 2 minutes</div>
            </div>
            <button className="zr-btn ghost sm" style={{ marginLeft: "auto" }}>Skip tonight</button>
          </div>

          <h1 className="zr-serif" style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 6 }}>
            <em style={{ fontStyle: "italic", color: "var(--accent)" }}>How did Sunday land?</em>
          </h1>
          <p style={{ color: "var(--text-dim)", maxWidth: 560, marginBottom: 28 }}>
            One question at a time. No grading. We're looking for patterns, not perfection.
          </p>

          {/* Mood */}
          <div style={{ marginBottom: 26 }}>
            <div className="zr-eyebrow" style={{ marginBottom: 12 }}>Overall energy</div>
            <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => {
                const picked = n === 7;
                return (
                  <div key={n} style={{
                    flex: 1, height: 56,
                    borderRadius: 8,
                    background: picked ? "var(--accent)" : "var(--surface)",
                    border: `1px solid ${picked ? "transparent" : "var(--border)"}`,
                    color: picked ? "#1a1208" : "var(--text-dim)",
                    display: "grid", placeItems: "center",
                    fontFamily: "Instrument Serif, serif",
                    fontSize: 22,
                  }}>{n}</div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--text-mute)" }}>
              <span>Depleted</span>
              <span>Steady</span>
              <span>Charged</span>
            </div>
          </div>

          {/* Body feeling pills */}
          <div style={{ marginBottom: 26 }}>
            <div className="zr-eyebrow" style={{ marginBottom: 12 }}>How does the body feel?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                ["Light", false], ["Heavy", true], ["Tense shoulders", true], ["Hungry", false],
                ["Wired", false], ["Sleepy", true], ["Sore legs", false], ["Headache", false],
                ["Stomach off", false], ["Restless", false], ["Calm", false],
              ].map(([t, on], i) => (
                <span key={i} className={"zr-pill" + (on ? " accent" : "")} style={{ cursor: "pointer", padding: "6px 12px", fontSize: 12 }}>
                  {on && <span className="dot"></span>}{t}
                </span>
              ))}
              <span className="zr-pill" style={{ padding: "6px 12px", borderStyle: "dashed", color: "var(--text-mute)" }}>{I.plus} other</span>
            </div>
          </div>

          {/* One question */}
          <div style={{ marginBottom: 26 }}>
            <div className="zr-eyebrow" style={{ marginBottom: 12 }}>One small thing</div>
            <div className="zr-serif" style={{ fontSize: 22, lineHeight: 1.3, color: "var(--text)", marginBottom: 10 }}>
              What's one moment today that gave you back energy?
            </div>
            <div style={{
              padding: 16,
              borderRadius: 12,
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-2)",
              minHeight: 100,
              fontSize: 14,
              lineHeight: 1.5,
            }}>
              Sitting on the back step at 4pm with the dog. No phone. The sun warmed up after the rain. I felt
              the day uncoil a little.
              <span style={{ display: "inline-block", width: 1, height: 16, background: "var(--accent)", verticalAlign: "middle", marginLeft: 2, animation: "blink 1s steps(2) infinite" }}/>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, fontSize: 11, color: "var(--text-mute)" }}>
              <span className="zr-pill" style={{ fontSize: 10 }}>Hold ⌥ to dictate</span>
              <span className="zr-pill" style={{ fontSize: 10 }}>34 / ∞ words</span>
              <span style={{ marginLeft: "auto" }}>Press <span className="zr-kbd">⌘↵</span> to save</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="zr-btn primary">{I.check} Save and rest</button>
            <button className="zr-btn">One more prompt</button>
            <button className="zr-btn ghost">Voice memo instead</button>
          </div>
        </div>

        {/* Sidebar: patterns + week */}
        <div style={{ display: "grid", gap: 14, gridAutoRows: "max-content" }}>
          <div className="zr-card">
            <div className="zr-card-head">
              <span className="zr-card-title">This week's mood</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
              {[
                ["M", 6], ["T", 7], ["W", 5], ["T", 6], ["F", 8], ["S", 7], ["S", 7, true],
              ].map(([d, n, today], i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: "100%", height: `${n*10}%`,
                    background: today
                      ? "linear-gradient(to top, var(--ag-iris), color-mix(in oklab, var(--ag-iris), white 30%))"
                      : "color-mix(in oklab, var(--ag-iris), transparent 60%)",
                    borderRadius: 4,
                  }}/>
                  <div style={{ fontSize: 10, color: "var(--text-mute)" }}>{d}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
              Average <b className="zr-mono" style={{ color: "var(--text)" }}>6.6</b> · highest after movement days
            </div>
          </div>

          <div className="zr-card">
            <div className="zr-card-head">
              <span className="zr-card-title">Patterns Iris is seeing</span>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { e: "↑", l: "Morning walks correlate with higher mood (4 of last 5)" },
                { e: "↓", l: "Late dinners precede tired mornings (3 of last 4)" },
                { e: "→", l: "“Heavy body” pills cluster on high-strain days" },
                { e: "★", l: "You light up on prompts about your dog. Keeping them." },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--text-2)" }}>
                  <span style={{ width: 18, color: "var(--ag-iris)" }} className="zr-serif">{p.e}</span>
                  <span>{p.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="zr-card">
            <div className="zr-card-head">
              <span className="zr-card-title">Last entry · Sat</span>
              <span className="zr-card-action">Open</span>
            </div>
            <p className="zr-serif" style={{ fontSize: 14, lineHeight: 1.45, color: "var(--text-2)" }}>
              "Long run, sore. Talked to my brother for the first time in a month. Worth being tired for."
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { ReflectionArtboard });
