// Zenra — Recovery / Sleep deep dive
// Hypnogram, HRV/RHR, recovery breakdown, 7-day pattern.

function Hypnogram() {
  // 4 stages: awake(0), rem(1), light(2), deep(3)
  // generate sequence over 8h sleep (~480 minutes), 30 segments
  const stages = [2,2,3,3,2,1,2,3,3,2,2,1,2,2,3,2,2,1,1,2,2,3,2,1,1,2,2,2,1,0];
  const colors = ["var(--text-mute)", "var(--ag-iris)", "var(--ag-lyra)", "var(--accent-2)"];
  const labels = ["Awake", "REM", "Light", "Deep"];
  const yOf = (s) => s * 26 + 12;
  const W = 760, H = 132;
  const segW = W / stages.length;

  // Build a step path
  let d = `M 0 ${yOf(stages[0])}`;
  for (let i = 1; i < stages.length; i++) {
    const x = i * segW;
    d += ` L ${x} ${yOf(stages[i-1])} L ${x} ${yOf(stages[i])}`;
  }
  d += ` L ${W} ${yOf(stages[stages.length-1])}`;

  return (
    <div className="zr-card" style={{ padding: 18 }}>
      <div className="zr-card-head">
        <span className="zr-card-title">Last night · hypnogram</span>
        <span className="zr-card-action">7h 36m in bed · 7h 04m asleep · 92.6% efficiency · {I.arrow}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingTop: 6, paddingBottom: 22 }}>
          {labels.map((l, i) => (
            <div key={l} style={{ fontSize: 10, color: colors[i], fontFamily: "JetBrains Mono", letterSpacing: ".06em", textTransform: "uppercase" }}>{l}</div>
          ))}
        </div>
        <div>
          <svg width="100%" height={H + 22} viewBox={`0 0 ${W} ${H + 22}`} preserveAspectRatio="none">
            {/* row lines */}
            {labels.map((_, i) => (
              <line key={i} x1="0" x2={W} y1={yOf(i) + 0} y2={yOf(i) + 0} stroke="var(--border-soft)"/>
            ))}
            {/* filled areas under each segment colored by stage */}
            {stages.map((s, i) => (
              <rect key={i} x={i * segW} y={yOf(s)}
                width={segW} height={H - yOf(s)}
                fill={colors[s]} fillOpacity=".10"/>
            ))}
            {/* line */}
            <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
            {/* time labels */}
            {["22:30","00:00","02:00","04:00","06:00"].map((t, i) => {
              const x = (i / 4) * W;
              return (
                <text key={t} x={x} y={H + 16}
                  textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
                  fontSize="10" fill="var(--text-mute)" fontFamily="JetBrains Mono">{t}</text>
              );
            })}
          </svg>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 12 }}>
            {[
              { k: "Deep",  v: "1h 24m", p: 20, color: "var(--accent-2)" },
              { k: "REM",   v: "1h 48m", p: 26, color: "var(--ag-iris)" },
              { k: "Light", v: "3h 32m", p: 50, color: "var(--ag-lyra)" },
              { k: "Awake", v: "0h 12m", p:  4, color: "var(--text-mute)" },
            ].map(s => (
              <div key={s.k}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }}></span>
                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{s.k}</span>
                  <span style={{ fontSize: 11, color: "var(--text-mute)", marginLeft: "auto" }} className="zr-mono">{s.p}%</span>
                </div>
                <div className="zr-serif" style={{ fontSize: 22 }}>{s.v}</div>
                <div className="zr-bar-track" style={{ marginTop: 6 }}>
                  <div className="zr-bar-fill" style={{ width: `${s.p}%`, background: s.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HRVChart() {
  // 14 days of HRV
  const data = [62,60,58,61,55,57,59,55,52,50,56,53,49,48];
  const baseline = 58;
  const W = 360, H = 140;
  const max = 70, min = 42;
  const xOf = (i) => (i / (data.length - 1)) * W;
  const yOf = (v) => H - ((v - min) / (max - min)) * (H - 20) - 6;
  const pts = data.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");
  const area = `0,${H} ${pts} ${W},${H}`;
  return (
    <div className="zr-card" style={{ padding: 18 }}>
      <div className="zr-card-head">
        <span className="zr-card-title">HRV · 14 days</span>
        <span className="zr-card-action">Trend ↓</span>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
        <div>
          <div className="zr-serif" style={{ fontSize: 36, lineHeight: 1, color: "var(--text)" }}>48<span className="zr-mono" style={{ fontSize: 12, color: "var(--text-mute)" }}>ms</span></div>
          <div style={{ fontSize: 11, color: "var(--ag-sage)", marginTop: 4 }}>−10ms vs baseline</div>
          <div className="zr-pill" style={{ marginTop: 12, fontSize: 10 }}>
            <span className="dot" style={{ background: "var(--warn)" }}></span>Trending low
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="hrvg" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--ag-sage)" stopOpacity=".25"/>
                <stop offset="100%" stopColor="var(--ag-sage)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* baseline */}
            <line x1="0" x2={W} y1={yOf(baseline)} y2={yOf(baseline)} stroke="var(--border-strong)" strokeDasharray="2 3"/>
            <text x={W - 4} y={yOf(baseline) - 4} textAnchor="end" fontSize="10" fill="var(--text-mute)" fontFamily="JetBrains Mono">baseline {baseline}</text>
            <polygon points={area} fill="url(#hrvg)"/>
            <polyline points={pts} fill="none" stroke="var(--ag-sage)" strokeWidth="1.5"/>
            {data.map((v, i) => (
              <circle key={i} cx={xOf(i)} cy={yOf(v)} r={i === data.length - 1 ? 3.5 : 1.5}
                fill={i === data.length - 1 ? "var(--accent)" : "var(--ag-sage)"}/>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

function RecoveryRings() {
  const items = [
    { label: "Autonomic",  v: 62, color: "var(--ag-sage)", note: "HRV-driven" },
    { label: "Sleep load", v: 82, color: "var(--ag-lyra)", note: "Last 3 nights" },
    { label: "Strain",     v: 71, color: "var(--ag-atlas)", note: "Recovers in 18h" },
  ];
  return (
    <div className="zr-card" style={{ padding: 18 }}>
      <div className="zr-card-head">
        <span className="zr-card-title">Recovery breakdown</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {items.map((it, i) => {
          const size = 92, r = 38, C = 2 * Math.PI * r;
          const filled = C * (it.v / 100);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative", width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="6"/>
                  <circle cx={size/2} cy={size/2} r={r} fill="none"
                    stroke={it.color} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${filled} ${C - filled}`}/>
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", flexDirection: "column" }}>
                  <div className="zr-serif" style={{ fontSize: 26 }}>{it.v}</div>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text)" }}>{it.label}</div>
                <div style={{ fontSize: 10, color: "var(--text-mute)" }}>{it.note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SevenDay() {
  const days = ["M","T","W","T","F","S","S"];
  const scores = [78, 72, 80, 65, 70, 62, 68];
  return (
    <div className="zr-card" style={{ padding: 18 }}>
      <div className="zr-card-head">
        <span className="zr-card-title">Readiness · last 7</span>
        <span className="zr-card-action">avg 71</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
        {scores.map((s, i) => {
          const h = (s / 100) * 100;
          const isToday = i === scores.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 11, color: isToday ? "var(--accent)" : "var(--text-mute)", fontFamily: "JetBrains Mono" }}>{s}</div>
              <div style={{
                width: "100%",
                height: `${h}%`,
                background: isToday
                  ? "linear-gradient(to top, var(--accent), var(--accent-2))"
                  : "color-mix(in oklab, var(--accent), transparent 70%)",
                borderRadius: 4,
                position: "relative",
              }}/>
              <div style={{ fontSize: 10, color: "var(--text-mute)" }}>{days[i]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VitalsTable() {
  const rows = [
    { k: "Resting HR",     v: "54 bpm",  t: "+2 vs 30d",  trend: "up", chart: [52,51,52,53,55,54,56] },
    { k: "Respiratory rate", v: "14.2 /m", t: "stable", trend: "flat", chart: [14,14,14.3,14.1,14.2,14.2,14.2] },
    { k: "SpO₂ avg",       v: "97%",     t: "normal range", trend: "flat", chart: [97,97,98,97,96,97,97] },
    { k: "Skin temperature", v: "−0.2°C", t: "within range", trend: "flat", chart: [.1,0,-.1,-.2,-.3,-.2,-.2] },
    { k: "VO₂ max (est.)", v: "47.8",    t: "+0.4 in 30d", trend: "up", chart: [46.9,47.0,47.1,47.3,47.5,47.7,47.8] },
  ];
  return (
    <div className="zr-card flush">
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
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "12px 18px", fontSize: 13, color: "var(--text-2)" }}>{r.k}</td>
              <td style={{ padding: "12px 18px", fontSize: 14, color: "var(--text)" }} className="zr-mono">{r.v}</td>
              <td style={{ padding: "12px 18px", fontSize: 12, color: "var(--text-dim)" }}>{r.t}</td>
              <td style={{ padding: "8px 18px", width: 140 }}>
                <MiniSpark color="var(--accent)" values={r.chart}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecoveryArtboard() {
  return (
    <Shell active="metrics" crumbs={["Recovery"]}>
      <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 22 }}>
        <div>
          <div className="zr-eyebrow" style={{ marginBottom: 8 }}>Recovery · Sunday, May 24</div>
          <h1 className="zr-serif" style={{ fontSize: 36, lineHeight: 1.1 }}>
            Your body is rebuilding — slowly.
          </h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span className="zr-pill"><span className="dot" style={{ background: "var(--ag-sage)" }}></span>Sage</span>
          <button className="zr-btn">{I.arrow} Compare 30d</button>
          <button className="zr-btn">Export</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <RecoveryRings/>
        <SevenDay/>
        <HRVChart/>
      </div>

      <div style={{ marginBottom: 14 }}>
        <Hypnogram/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <VitalsTable/>
        <div className="zr-card">
          <div className="zr-card-head">
            <span className="zr-card-title">What Sage is reading</span>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {[
              { ag: "lyra",  l: "Sleep efficiency 78%, REM down 14m vs your 30-day average." },
              { ag: "sage",  l: "HRV 48ms — three nights below baseline. Looks like cumulative load." },
              { ag: "atlas", l: "Last 3 sessions averaged RPE 8/10. I'd recommend an unloading day." },
              { ag: "fern",  l: "Dinner has been late 4 of 5 nights — correlated with your low HRV." },
            ].map((x, i) => {
              const a = AGENTS[x.ag];
              return (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <AgentGlyph agent={x.ag}/>
                  <div style={{ fontSize: 13, color: "var(--text-2)", paddingTop: 4 }}>
                    <b style={{ color: a.color }}>{a.name}</b> — {x.l}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="zr-divider"></div>
          <button className="zr-btn primary sm">{I.spark} Get Sage's plan to rebuild</button>
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { RecoveryArtboard });
