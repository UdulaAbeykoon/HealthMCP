// Zenra — Home (conversation-first, orb-led)

function VoiceBtn() {
  return (
    <button className="zr-btn" style={{
      color: "var(--accent)",
      border: "1px solid var(--accent-soft-2)",
      borderRadius: 999,
      paddingLeft: 14, paddingRight: 18,
    }}>
      <span style={{ width: 16, height: 16, color: "var(--accent)" }}>{I.bolt}</span>
      Voice on
    </button>
  );
}

function ThemeBtn() {
  return (
    <button className="zr-btn icon" style={{ color: "var(--text-dim)" }}>
      {I.sun}
    </button>
  );
}

function AvatarBtn() {
  return (
    <div className="zr-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>E</div>
  );
}

function Suggestion({ icon, text, color }) {
  return (
    <div className="zr-sugg">
      <span className="zr-sugg-ic" style={{ background: `color-mix(in oklab, ${color}, white 86%)`, color }}>
        <span style={{ width: 14, height: 14 }}>{icon}</span>
      </span>
      <span style={{ lineHeight: 1.3 }}>{text}</span>
    </div>
  );
}

/* ---------------- right-rail metric cards ----------------------- */

function SleepCard() {
  const bars = [.65,.78,.82,.74,.88,.7,.6,.85,.78,.92,.7,.6];
  return (
    <div className="zr-card zr-metric">
      <div className="zr-eyebrow"><span style={{ width: 14, height: 14, color: "var(--ag-lyra)" }}>{I.moon}</span> Sleep</div>
      <div style={{ marginTop: 8 }}>
        <span className="v">7</span><span className="u">h</span>
        <span className="v" style={{ marginLeft: 8 }}>42</span><span className="u">m</span>
      </div>
      <div style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 2 }}>Today</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56, marginTop: 16 }}>
        {bars.map((v, i) => (
          <div key={i} style={{
            flex: 1, height: `${v * 100}%`,
            background: i > 7 ? "var(--accent)" : "color-mix(in oklab, var(--accent), white 60%)",
            borderRadius: 2,
            opacity: .9,
          }}/>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-mute)", marginTop: 8 }} className="zr-mono">
        <span>11:15 PM</span><span>7:02 AM</span>
      </div>
    </div>
  );
}

function RecoveryCard() {
  const size = 100, r = 42, C = 2 * Math.PI * r;
  const v = 82, filled = C * (v / 100);
  return (
    <div className="zr-card zr-metric">
      <div className="zr-eyebrow"><span style={{ width: 14, height: 14, color: "var(--accent)" }}>{I.spark}</span> Recovery</div>
      <div style={{ display: "grid", placeItems: "center", marginTop: 14, position: "relative", width: size, height: size, marginInline: "auto" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="color-mix(in oklab, var(--accent), white 85%)" strokeWidth="6"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${filled} ${C - filled}`}/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <span className="zr-serif" style={{ fontSize: 26 }}>{v}%</span>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 6, color: "var(--accent)", fontSize: 12 }}>Good</div>
      <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-mute)", marginTop: 4 }}>
        Great recovery yesterday
      </div>
    </div>
  );
}

function HRVCard() {
  const data = [56,58,55,57,60,58,61,59,62,60,63,62];
  const W = 220, H = 40;
  const max = Math.max(...data), min = Math.min(...data);
  const xOf = (i) => (i / (data.length - 1)) * W;
  const yOf = (v) => H - ((v - min) / (max - min || 1)) * (H - 6) - 3;
  const pts = data.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");
  return (
    <div className="zr-card zr-metric">
      <div className="zr-eyebrow"><span style={{ width: 14, height: 14, color: "var(--ag-sage)" }}>{I.metrics}</span> HRV</div>
      <div style={{ marginTop: 8 }}>
        <span className="v">62</span><span className="u">ms</span>
      </div>
      <div style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 2 }}>Baseline 58 ms</div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ marginTop: 14 }}>
        <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
        <circle cx={xOf(data.length - 1)} cy={yOf(data[data.length - 1])} r="3" fill="var(--accent)"/>
      </svg>
    </div>
  );
}

function StepsCard() {
  return (
    <div className="zr-card zr-metric">
      <div className="zr-eyebrow"><span style={{ width: 14, height: 14, color: "var(--ag-atlas)" }}>{I.atlasFoot || I.bolt}</span> Steps</div>
      <div style={{ marginTop: 8 }}>
        <span className="v">8,246</span>
      </div>
      <div style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 2 }}>Today</div>
      <div className="zr-bar-track" style={{ marginTop: 16, height: 5 }}>
        <div className="zr-bar-fill" style={{ width: "82%" }}/>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 8 }}>82% of goal</div>
    </div>
  );
}

/* ---------------- main artboard --------------------------------- */

function DashboardArtboard() {
  return (
    <Shell active="home" topRight={<><VoiceBtn/><ThemeBtn/><AvatarBtn/></>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28, paddingTop: 6 }}>
        {/* center column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24 }}>
          <h1 className="zr-serif" style={{ fontSize: 44, textAlign: "center", letterSpacing: "-0.01em", marginBottom: 6 }}>
            Good morning, Elena
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: 16, textAlign: "center" }}>
            How can I help with your health today?
          </p>

          <div style={{ marginTop: 28 }}>
            <Orb size={320}/>
          </div>

          <div className="zr-listen" style={{ marginTop: 16 }}>
            <span className="zr-listen-bars">
              <span></span><span></span><span></span><span></span><span></span>
            </span>
            Listening…
          </div>

          <div style={{ width: "100%", maxWidth: 880, marginTop: 56 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Suggestion icon={I.moon}    color="var(--ag-lyra)"  text="How did I sleep last night?"/>
              <Suggestion icon={I.bolt}    color="var(--ag-atlas)" text="What can I do to boost energy?"/>
              <Suggestion icon={I.metrics} color="var(--ag-sage)"  text="Is my recovery on track?"/>
              <Suggestion icon={I.meal}    color="var(--ag-fern)"  text="How can I manage stress?"/>
            </div>

            <div className="zr-msg" style={{ marginTop: 28 }}>
              <span style={{ flex: 1, padding: "12px 0" }}>Message or hold space to talk…</span>
              <button className="zr-btn ghost icon" style={{ color: "var(--text-mute)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" width="18" height="18"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></svg>
              </button>
              <span className="zr-msg-mic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" width="18" height="18">
                  <rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>
                </svg>
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 16, color: "var(--text-mute)", fontSize: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
              Your conversations are private and secure
            </div>
          </div>
        </div>

        {/* right rail */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <SleepCard/>
          <RecoveryCard/>
          <HRVCard/>
          <StepsCard/>
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { DashboardArtboard });
