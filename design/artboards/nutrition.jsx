// Zenra — Nutrition plan

function MacrosRing() {
  const macros = [
    { k: "Protein", v: 86, target: 140, color: "var(--ag-atlas)" },
    { k: "Carbs",   v: 152, target: 220, color: "var(--ag-orchid)" },
    { k: "Fat",     v: 48, target: 70,  color: "var(--ag-fern)" },
  ];
  const size = 200, R = 80;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {macros.map((m, i) => {
          const r = R - i * 14;
          const C = 2 * Math.PI * r;
          const pct = Math.min(1, m.v / m.target);
          const filled = C * pct;
          return (
            <g key={i}>
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="9"/>
              <circle cx={size/2} cy={size/2} r={r} fill="none"
                stroke={m.color} strokeWidth="9" strokeLinecap="round"
                strokeDasharray={`${filled} ${C - filled}`}/>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="zr-eyebrow">Today · kcal</div>
        <div className="zr-serif" style={{ fontSize: 36, lineHeight: 1 }}>1,420</div>
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>of 2,100 target</div>
      </div>
    </div>
  );
}

function MealRow({ time, meal, sub, kcal, protein, suggested, image }) {
  return (
    <div className="zr-card" style={{
      padding: 14, display: "grid",
      gridTemplateColumns: "70px 64px 1fr auto auto", gap: 14, alignItems: "center",
      background: suggested ? "var(--surface-2)" : "var(--surface)",
      borderColor: suggested ? "var(--accent-soft-2)" : "var(--border)",
    }}>
      <div style={{ fontSize: 12, color: "var(--text-dim)" }} className="zr-mono">{time}</div>
      <div className="zr-ph" style={{ height: 64, fontSize: 9 }}>{image}</div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, color: "var(--text)" }}>{meal}</span>
          {suggested && <span className="zr-pill accent" style={{ fontSize: 10 }}>Fern proposed</span>}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="zr-mono" style={{ fontSize: 15 }}>{kcal}<span style={{ fontSize: 10, color: "var(--text-mute)" }}> kcal</span></div>
        <div style={{ fontSize: 11, color: "var(--ag-atlas)" }}>{protein}g protein</div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {suggested ? (
          <>
            <button className="zr-btn primary sm">{I.check}</button>
            <button className="zr-btn sm">{I.edit}</button>
          </>
        ) : (
          <button className="zr-btn ghost icon sm">{I.dots}</button>
        )}
      </div>
    </div>
  );
}

function NutritionArtboard() {
  return (
    <Shell active="plan" agentActive="fern" crumbs={["Nutrition · Today"]}>
      <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 22 }}>
        <div>
          <div className="zr-eyebrow" style={{ marginBottom: 8 }}>Fern · planning around today's load</div>
          <h1 className="zr-serif" style={{ fontSize: 36, lineHeight: 1.1, maxWidth: 720 }}>
            Front-load protein. Finish dinner before <em style={{ color: "var(--accent)", fontStyle: "italic" }}>7:30</em>.
          </h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="zr-btn">Swap to vegetarian</button>
          <button className="zr-btn">Generate shopping list</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 300px", gap: 14, marginBottom: 14 }}>
        <div className="zr-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 22 }}>
          <MacrosRing/>
          <div style={{ width: "100%", display: "grid", gap: 8, marginTop: 18 }}>
            {[
              { k: "Protein", v: "86 / 140g", color: "var(--ag-atlas)", p: 61 },
              { k: "Carbs",   v: "152 / 220g", color: "var(--ag-orchid)", p: 69 },
              { k: "Fat",     v: "48 / 70g",   color: "var(--ag-fern)", p: 68 },
            ].map((m, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }}></span>
                    <span style={{ color: "var(--text-dim)" }}>{m.k}</span>
                  </span>
                  <span className="zr-mono" style={{ color: "var(--text)" }}>{m.v}</span>
                </div>
                <div className="zr-bar-track">
                  <div className="zr-bar-fill" style={{ width: `${m.p}%`, background: m.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="zr-card">
          <div className="zr-card-head">
            <span className="zr-card-title">Today's plan · 4 meals</span>
            <span className="zr-card-action">Coordinated with Atlas (workout 16:00) · {I.arrow}</span>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <MealRow time="07:30" meal="Greek yogurt + walnuts + berries"
              sub="Slow protein, polyphenols. Coffee 30 min later."
              kcal="380" protein="28" image="OATS"/>
            <MealRow time="12:15" meal="Salmon, lentils, roasted greens"
              suggested
              sub="Bumped to 38g protein — you're 2 days light."
              kcal="540" protein="38" image="LUNCH"/>
            <MealRow time="15:30" meal="Cottage cheese + honey"
              sub="Pre-workout · 60 min before Atlas's session"
              kcal="190" protein="22" image="SNACK"/>
            <MealRow time="18:45" meal="Chicken + sweet potato + miso greens"
              suggested
              sub="Early — Iris flagged late dinners. Done by 19:30."
              kcal="610" protein="42" image="DINNER"/>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14, gridAutoRows: "max-content" }}>
          <div className="zr-card">
            <div className="zr-card-head">
              <span className="zr-card-title">Hydration</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 38, borderRadius: 4,
                  background: i < 4 ? "var(--ag-echo)" : "var(--surface)",
                  border: "1px solid var(--border)",
                  opacity: i < 4 ? .8 : .5,
                }}/>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-dim)" }}>
              <span>4 / 8 glasses</span>
              <span className="zr-mono">+400 ml needed before noon</span>
            </div>
            <button className="zr-btn sm" style={{ marginTop: 10, width: "100%" }}>
              {I.drop} Log a glass
            </button>
          </div>

          <div className="zr-card">
            <div className="zr-card-head">
              <span className="zr-card-title">Why these meals?</span>
            </div>
            <div style={{ display: "grid", gap: 10, fontSize: 12 }}>
              {[
                { ag: "atlas", t: "Higher protein → support Z2 cardio recovery" },
                { ag: "sage",  t: "Polyphenols + early dinner → HRV rebound" },
                { ag: "iris",  t: "Last meal ≤7:30pm — fixes 3-day pattern" },
                { ag: "lyra",  t: "No caffeine after 13:00 protects 22:30 bedtime" },
              ].map((r, i) => {
                const a = AGENTS[r.ag];
                return (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: 5,
                      background: `color-mix(in oklab, ${a.color}, transparent 78%)`,
                      color: a.color, display: "grid", placeItems: "center", flexShrink: 0,
                    }}><span style={{ width: 12, height: 12 }}><GlyphSvg id={r.ag}/></span></span>
                    <span style={{ color: "var(--text-2)" }}>{r.t}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="zr-card">
            <div className="zr-card-head">
              <span className="zr-card-title">Pantry · in fridge</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Salmon", "Lentils", "Kale", "Sweet potato", "Greek yogurt", "Berries", "Cottage cheese", "Miso", "Walnuts"].map((p, i) => (
                <span key={i} className="zr-pill" style={{ fontSize: 11 }}>{p}</span>
              ))}
            </div>
            <button className="zr-btn ghost sm" style={{ marginTop: 12, width: "100%" }}>
              Open shopping list (5 missing)
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { NutritionArtboard });
