// Zenra — Conductor / Planner
// THE wow screen. 3 variations toggled via Tweaks (conductor = 0|1|2).

// -- Shared header ------------------------------------------------
function ConductorHeader({ variant, setVariant }) {
  const variants = [
    { id: 0, label: "Timeline" },
    { id: 1, label: "Network" },
    { id: 2, label: "Calendar overlay" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 18, gap: 18 }}>
      <div>
        <div className="zr-eyebrow" style={{ marginBottom: 8 }}>The Conductor</div>
        <h1 className="zr-serif" style={{ fontSize: 36, lineHeight: 1.1, maxWidth: 720 }}>
          How your agents are <em style={{ color: "var(--accent)", fontStyle: "italic" }}>quietly coordinating</em> today.
        </h1>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
        <div style={{
          display: "inline-flex", padding: 3, borderRadius: 10,
          background: "var(--surface-2)", border: "1px solid var(--border)",
        }}>
          {variants.map(v => (
            <button key={v.id}
              onClick={() => setVariant?.(v.id)}
              className="zr-btn sm"
              style={{
                background: variant === v.id ? "var(--surface-elev)" : "transparent",
                border: 0,
                color: variant === v.id ? "var(--text)" : "var(--text-dim)",
                boxShadow: variant === v.id ? "inset 0 0 0 1px var(--border)" : "none",
              }}>
              {v.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-mute)" }}>
          Toggle in Tweaks → Conductor view
        </span>
      </div>
    </div>
  );
}

// -- Legend (agent rows) -----------------------------------------
function AgentLegend() {
  return (
    <div className="zr-card" style={{ padding: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span className="zr-card-title">Active agents</span>
        {["orchid", "lyra", "atlas", "sage", "echo", "fern", "iris"].map(id => {
          const a = AGENTS[id];
          return (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: a.color }}></span>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>{a.name}</span>
              <span style={{ fontSize: 11, color: "var(--text-mute)" }}>{a.role}</span>
            </div>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-mute)" }} className="zr-mono">
          7 agents · 24 signals · 7 proposals · 3 commitments
        </span>
      </div>
    </div>
  );
}

// =================================================================
// Variant 0: TIMELINE swimlanes
// =================================================================
function ConductorTimeline() {
  const hours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
  const start = 6, end = 22, span = end - start;
  const W = 1080;

  const lanes = [
    { id: "orchid", events: [
      { s: 7.2, e: 7.4, kind: "signal", t: "Meeting load: heavy" },
      { s: 8.5, e: 10.5, kind: "block", t: "Sync (moved → 10:30)" },
      { s: 13.5, e: 15, kind: "block", t: "Calls window" },
    ]},
    { id: "lyra", events: [
      { s: 6, e: 7, kind: "signal", t: "Slept light · 78% eff" },
      { s: 21, e: 22, kind: "block", t: "Wind-down" },
    ]},
    { id: "sage", events: [
      { s: 6.5, e: 7, kind: "signal", t: "HRV −12%" },
      { s: 14, e: 15, kind: "watch", t: "Afternoon dip ahead" },
    ]},
    { id: "atlas", events: [
      { s: 7, e: 7.8, kind: "block", t: "Morning walk" },
      { s: 16, e: 17, kind: "block", t: "Z2 cardio · 45m" },
    ]},
    { id: "echo", events: [
      { s: 8, e: 11.5, kind: "block", t: "Focus mode — Slack held" },
      { s: 14, e: 16, kind: "watch", t: "Quiet calls window" },
    ]},
    { id: "fern", events: [
      { s: 12, e: 13, kind: "block", t: "Protein lunch" },
      { s: 18.5, e: 19, kind: "block", t: "Early dinner (Iris flag)" },
    ]},
    { id: "iris", events: [
      { s: 21.5, e: 22, kind: "block", t: "Evening reflection" },
    ]},
  ];

  // Coordination lines: (agent_from, time_from, agent_to, time_to, label)
  const links = [
    { fromA: "lyra", fromT: 6.5, toA: "orchid", toT: 8.5, label: "Reschedule 9am" },
    { fromA: "sage", fromT: 6.7, toA: "atlas",  toT: 16,  label: "Swap to Z2" },
    { fromA: "echo", fromT: 8.5, toA: "orchid", toT: 13.5, label: "Protect focus" },
    { fromA: "iris", fromT: 21.7, toA: "fern",  toT: 18.7, label: "Earlier dinner" },
  ];
  const rowH = 56;
  const padL = 110;
  const totalH = lanes.length * rowH + 30;
  const xOf = (t) => padL + ((t - start) / span) * (W - padL - 20);
  const yOf = (i) => 20 + i * rowH + rowH / 2 - 8;

  return (
    <div className="zr-card" style={{ padding: 18 }}>
      <div className="zr-card-head">
        <span className="zr-card-title">Today · 06:00 → 22:00</span>
        <span className="zr-card-action">4 coordinations · 12 commitments · {I.arrow}</span>
      </div>

      <div style={{ position: "relative", height: totalH }}>
        {/* hour grid + labels */}
        <svg width="100%" height={totalH} viewBox={`0 0 ${W} ${totalH}`} preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {hours.map((h, i) => {
            const x = xOf(h);
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={4} y2={totalH - 18} stroke="var(--border-soft)"/>
                <text x={x} y={totalH - 4} textAnchor="middle" fontSize="9" fill="var(--text-mute)"
                  fontFamily="JetBrains Mono">{h % 12 || 12}{h < 12 ? "a" : "p"}</text>
              </g>
            );
          })}
          {/* now line */}
          <line x1={xOf(9.6)} x2={xOf(9.6)} y1={0} y2={totalH - 18}
            stroke="var(--accent)" strokeDasharray="3 3"/>
          <circle cx={xOf(9.6)} cy={4} r="3" fill="var(--accent)"/>

          {/* coordination links: curved bezier between agent lanes */}
          {links.map((l, idx) => {
            const fromIdx = lanes.findIndex(L => L.id === l.fromA);
            const toIdx = lanes.findIndex(L => L.id === l.toA);
            const x1 = xOf(l.fromT), y1 = yOf(fromIdx) + 8;
            const x2 = xOf(l.toT),   y2 = yOf(toIdx) + 8;
            const dx = (x2 - x1) * 0.5;
            const d = `M ${x1} ${y1} C ${x1+dx} ${y1}, ${x2-dx} ${y2}, ${x2} ${y2}`;
            return (
              <g key={idx}>
                <path d={d} fill="none" stroke="var(--accent)" strokeOpacity=".35" strokeWidth="1" strokeDasharray="2 3"/>
                <circle cx={x1} cy={y1} r="2.5" fill="var(--accent)"/>
                <circle cx={x2} cy={y2} r="2.5" fill="var(--accent)"/>
              </g>
            );
          })}
        </svg>

        {/* lanes (HTML overlay for crisp typography) */}
        {lanes.map((lane, i) => {
          const a = AGENTS[lane.id];
          return (
            <div key={lane.id} style={{
              position: "absolute", left: 0, right: 0,
              top: 20 + i * rowH, height: rowH,
              borderTop: i === 0 ? "none" : "1px dashed var(--border-soft)",
            }}>
              <div style={{
                position: "absolute", left: 0, top: rowH / 2 - 12,
                display: "flex", alignItems: "center", gap: 8, width: padL - 8,
              }}>
                <AgentGlyph agent={lane.id}/>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12 }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-mute)" }}>{a.role}</div>
                </div>
              </div>
              {lane.events.map((ev, j) => {
                const x = xOf(ev.s);
                const w = xOf(ev.e) - xOf(ev.s);
                const isBlock = ev.kind === "block";
                const isWatch = ev.kind === "watch";
                return (
                  <div key={j} style={{
                    position: "absolute", left: x, width: w,
                    top: rowH / 2 - 14, height: 28,
                    borderRadius: 7,
                    background: isBlock
                      ? `color-mix(in oklab, ${a.color}, transparent 78%)`
                      : isWatch
                        ? `color-mix(in oklab, ${a.color}, transparent 92%)`
                        : "transparent",
                    border: `1px ${ev.kind === "signal" ? "dashed" : "solid"} color-mix(in oklab, ${a.color}, transparent ${isBlock ? 55 : 78}%)`,
                    padding: "0 8px",
                    display: "flex", alignItems: "center",
                    fontSize: 11,
                    color: "var(--text-2)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {ev.kind === "signal" && <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: a.color, marginRight: 6, flex: "0 0 auto",
                    }}/>}
                    {ev.t}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =================================================================
// Variant 1: NETWORK graph
// =================================================================
function ConductorNetwork() {
  const W = 1080, H = 560;
  const cx = W / 2, cy = H / 2;
  const R = 200;
  const ids = ["orchid", "lyra", "atlas", "sage", "echo", "fern", "iris"];
  const positions = ids.map((id, i) => {
    const ang = -Math.PI/2 + (i / ids.length) * Math.PI * 2;
    return { id, x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R };
  });
  const pos = (id) => positions.find(p => p.id === id);

  // Signals = outer ring nodes; proposals = inner connections
  const signals = [
    { id: "s1", to: "lyra",  label: "Sleep eff 78%",  ang: -1.7, r: R + 110 },
    { id: "s2", to: "sage",  label: "HRV −12%",       ang: -0.9, r: R + 100 },
    { id: "s3", to: "orchid",label: "9am · low stakes", ang: -0.3, r: R + 100 },
    { id: "s4", to: "echo",  label: "Slack: 12 msgs", ang: 0.5,  r: R + 110 },
    { id: "s5", to: "fern",  label: "Dinner trend",   ang: 1.3,  r: R + 100 },
    { id: "s6", to: "atlas", label: "3× hard sessions", ang: 2.2, r: R + 110 },
    { id: "s7", to: "iris",  label: "Missed 3 check-ins", ang: -2.6, r: R + 100 },
  ];
  const proposals = [
    { from: "orchid", to: "lyra",   label: "Push 9am",       weight: 3 },
    { from: "atlas",  to: "sage",   label: "Swap to Z2",     weight: 3 },
    { from: "echo",   to: "orchid", label: "Hold pings",     weight: 2 },
    { from: "fern",   to: "iris",   label: "Earlier dinner", weight: 2 },
    { from: "lyra",   to: "orchid", label: "Wind-down 21:00", weight: 1 },
    { from: "iris",   to: "lyra",   label: "Reflect nudge",  weight: 1 },
  ];

  return (
    <div className="zr-card" style={{ padding: 18 }}>
      <div className="zr-card-head">
        <span className="zr-card-title">Live coordination graph</span>
        <span className="zr-card-action">Hover an edge to see reasoning · {I.arrow}</span>
      </div>
      <div style={{ position: "relative" }}>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id="ctr">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity=".35"/>
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
            </radialGradient>
          </defs>
          {/* center glow */}
          <circle cx={cx} cy={cy} r="80" fill="url(#ctr)"/>

          {/* signal connections (dashed, faint) */}
          {signals.map(s => {
            const p = pos(s.to);
            const sx = cx + Math.cos(s.ang) * s.r;
            const sy = cy + Math.sin(s.ang) * s.r;
            return (
              <g key={s.id}>
                <line x1={sx} y1={sy} x2={p.x} y2={p.y}
                  stroke={AGENTS[s.to].color} strokeOpacity=".4" strokeDasharray="2 3"/>
                <circle cx={sx} cy={sy} r="3" fill={AGENTS[s.to].color}/>
              </g>
            );
          })}

          {/* proposal edges between agents (through center) */}
          {proposals.map((p, i) => {
            const a = pos(p.from), b = pos(p.to);
            // curve toward center
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            const tx = cx + (mx - cx) * 0.25, ty = cy + (my - cy) * 0.25;
            const d = `M ${a.x} ${a.y} Q ${tx} ${ty} ${b.x} ${b.y}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="var(--accent)" strokeOpacity=".5" strokeWidth={p.weight}/>
                <circle cx={tx + (a.x-cx)*.02} cy={ty + (a.y-cy)*.02} r="6"
                  fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1"/>
              </g>
            );
          })}

          {/* center label */}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11"
            fill="var(--text-mute)" fontFamily="JetBrains Mono" letterSpacing="2">CONDUCTOR</text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize="22"
            fill="var(--text)" fontFamily="Instrument Serif, serif">7 proposals · 1 day</text>

          {/* signal labels */}
          {signals.map(s => {
            const sx = cx + Math.cos(s.ang) * (s.r + 6);
            const sy = cy + Math.sin(s.ang) * (s.r + 6);
            const anchor = sx < cx - 20 ? "end" : sx > cx + 20 ? "start" : "middle";
            return (
              <text key={s.id} x={sx} y={sy} textAnchor={anchor}
                fontSize="10" fill="var(--text-dim)"
                dominantBaseline="middle">{s.label}</text>
            );
          })}
        </svg>

        {/* agent nodes overlay for sharp glyphs */}
        {positions.map(p => {
          const a = AGENTS[p.id];
          return (
            <div key={p.id} style={{
              position: "absolute", left: `${(p.x / W) * 100}%`, top: p.y,
              transform: "translate(-50%, -50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `color-mix(in oklab, ${a.color}, transparent 80%)`,
                border: `1px solid color-mix(in oklab, ${a.color}, transparent 55%)`,
                display: "grid", placeItems: "center",
                color: a.color,
                boxShadow: `0 0 0 6px var(--bg), 0 0 24px ${a.color}22`,
              }}>
                <span style={{ width: 26, height: 26 }}><GlyphSvg id={a.id}/></span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text)" }}>{a.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-mute)", marginTop: -4 }}>{a.role}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =================================================================
// Variant 2: CALENDAR overlay
// =================================================================
function ConductorCalendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = [19, 20, 21, 22, 23, 24, 25];
  const hours = [6, 9, 12, 15, 18, 21];
  // Heat by day+hour (which agents touched the slot)
  const cells = {};
  const setCell = (d, h, agents) => { cells[`${d}-${h}`] = agents; };
  // example data
  for (let d = 0; d < 7; d++) {
    setCell(d, 6, ["lyra"]);
    setCell(d, 9, d === 6 ? ["orchid", "echo"] : ["orchid"]);
    setCell(d, 12, ["fern"]);
    setCell(d, 15, ["echo", "orchid"]);
    setCell(d, 18, d % 2 ? ["atlas", "fern"] : ["fern"]);
    setCell(d, 21, ["lyra", "iris"]);
  }
  // make today (col 6) richer
  setCell(6, 9, ["orchid", "lyra", "echo"]);
  setCell(6, 15, ["atlas", "echo"]);
  setCell(6, 18, ["fern", "iris"]);

  return (
    <div className="zr-card" style={{ padding: 18 }}>
      <div className="zr-card-head">
        <span className="zr-card-title">Week of May 19 · agent activity</span>
        <span className="zr-card-action">Each cell shows which agents touched the slot · {I.arrow}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "44px repeat(7, 1fr)", gap: 4 }}>
        <div></div>
        {days.map((d, i) => (
          <div key={d} style={{
            textAlign: "center",
            padding: "6px 0",
            fontSize: 11,
            color: i === 6 ? "var(--accent)" : "var(--text-dim)",
          }}>
            <div className="zr-mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>{d.toUpperCase()}</div>
            <div className="zr-serif" style={{ fontSize: 22 }}>{dates[i]}</div>
          </div>
        ))}

        {hours.map((h, hi) => (
          <React.Fragment key={h}>
            <div className="zr-mono" style={{
              fontSize: 10, color: "var(--text-mute)",
              display: "flex", alignItems: "center", justifyContent: "flex-end",
              paddingRight: 6,
            }}>{h % 12 || 12}{h < 12 ? "a" : "p"}</div>
            {days.map((_, di) => {
              const cellAgents = cells[`${di}-${h}`] || [];
              const isToday = di === 6;
              return (
                <div key={di} style={{
                  background: isToday ? "var(--surface-2)" : "var(--surface)",
                  border: `1px solid ${isToday ? "var(--accent-soft-2)" : "var(--border)"}`,
                  borderRadius: 8,
                  minHeight: 64,
                  padding: 6,
                  display: "flex", flexDirection: "column", gap: 4,
                  position: "relative",
                }}>
                  {cellAgents.map((id, i) => {
                    const a = AGENTS[id];
                    return (
                      <div key={i} style={{
                        height: 14, borderRadius: 3,
                        background: `color-mix(in oklab, ${a.color}, transparent ${isToday ? 60 : 75}%)`,
                        borderLeft: `2px solid ${a.color}`,
                        padding: "0 4px",
                        fontSize: 9,
                        color: isToday ? "var(--text)" : "var(--text-dim)",
                        display: "flex", alignItems: "center",
                      }}>{a.name}</div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div style={{
        marginTop: 14, padding: 14,
        borderRadius: 10,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ color: "var(--accent)" }}>{I.spark}</span>
        <span style={{ fontSize: 12, color: "var(--text-2)", maxWidth: 720 }}>
          <b style={{ color: "var(--text)" }}>This week's pattern:</b> Fern, Iris and Lyra are coordinating to pull dinner
          earlier — three nights running. Today they're aligned with Echo to keep the evening quiet.
        </span>
        <button className="zr-btn sm" style={{ marginLeft: "auto" }}>See reasoning</button>
      </div>
    </div>
  );
}

// =================================================================
// Reasoning trail (shared, below every variant)
// =================================================================
function ReasoningTrail() {
  const steps = [
    { agent: "lyra",  t: "06:32", line: "Sleep efficiency 78% · REM down 14m. Flagging recovery." },
    { agent: "sage",  t: "06:33", line: "HRV reads 48ms (−12% vs 7-day). Recommending low-stakes morning." },
    { agent: "orchid",t: "06:34", line: "Scanning 09:00 sync — internal, both attendees flexible. Proposing 10:30." },
    { agent: "echo",  t: "06:35", line: "Aligning focus block to new start. Slack hold until 11:30." },
    { agent: "atlas", t: "07:01", line: "Recovery 62 < 70 threshold. Swap intervals → Z2 cardio @16:00." },
    { agent: "iris",  t: "07:02", line: "Three skipped check-ins. Scheduling soft prompt 21:30." },
    { agent: "fern",  t: "07:04", line: "Aligning earlier dinner (Iris flag). Lunch protein bumped to 38g." },
  ];
  return (
    <div className="zr-card">
      <div className="zr-card-head">
        <span className="zr-card-title">Reasoning trail · this morning</span>
        <span className="zr-card-action">Newest first · everything is explainable {I.arrow}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "100px 32px 1fr", rowGap: 12, alignItems: "center" }}>
        {steps.map((s, i) => {
          const a = AGENTS[s.agent];
          return (
            <React.Fragment key={i}>
              <div className="zr-mono" style={{ fontSize: 11, color: "var(--text-mute)" }}>{s.t}</div>
              <div style={{
                width: 24, height: 24, borderRadius: 7,
                background: `color-mix(in oklab, ${a.color}, transparent 78%)`,
                color: a.color,
                display: "grid", placeItems: "center",
              }}>
                <span style={{ width: 14, height: 14 }}><GlyphSvg id={s.agent}/></span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                <b style={{ color: "var(--text)" }}>{a.name}</b> · {s.line}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ConductorArtboard({ variant = 0, setVariant }) {
  const Body = [ConductorTimeline, ConductorNetwork, ConductorCalendar][variant] || ConductorTimeline;
  return (
    <Shell active="cond" crumbs={["Conductor"]}>
      <ConductorHeader variant={variant} setVariant={setVariant}/>
      <AgentLegend/>
      <div style={{ display: "grid", gap: 14 }}>
        <Body/>
        <ReasoningTrail/>
      </div>
    </Shell>
  );
}

Object.assign(window, { ConductorArtboard });
