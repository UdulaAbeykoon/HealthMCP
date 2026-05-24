// Zenra — slimmed sidebar shell (cool light direction).

const NAV = [
  { id: "home",    label: "Chat",       icon: I.feed },
  { id: "today",   label: "Today",      icon: I.plan },
  { id: "feed",    label: "Action Feed", icon: I.spark, badge: "3" },
  { id: "cond",    label: "Insights",   icon: I.cond },
  { id: "metrics", label: "Trends",     icon: I.metrics },
  { id: "reflect", label: "History",    icon: I.reflect },
];
const NAV_FOOT = [
  { id: "links",    label: "Integrations", icon: I.link },
  { id: "settings", label: "Settings",     icon: I.cog },
];

function Sidebar({ active }) {
  return (
    <aside className="zr-side">
      <div className="zr-brand">
        <div className="zr-brand-mark"></div>
        <div>
          <div className="zr-brand-name">Zenra</div>
          <div className="zr-brand-sub">Health agent</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(n => (
          <div key={n.id} className={"zr-nav" + (active === n.id ? " is-active" : "")}>
            <span className="zr-nav-ic">{n.icon}</span>
            <span>{n.label}</span>
            {n.badge && <span className="zr-nav-badge">{n.badge}</span>}
          </div>
        ))}
      </div>

      <div className="zr-promo">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ color: "var(--accent)", display: "grid", placeItems: "center", width: 16, height: 16 }}>{I.spark}</span>
          <span style={{ fontSize: 13 }}>Pro plan</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.45 }}>
          Unlock deeper insights and personalized recommendations.
        </p>
        <button style={{
          marginTop: 12, color: "var(--accent)", fontSize: 13,
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>Upgrade now →</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "auto" }}>
        {NAV_FOOT.map(n => (
          <div key={n.id} className={"zr-nav" + (active === n.id ? " is-active" : "")}>
            <span className="zr-nav-ic">{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </div>

      <div className="zr-side-foot" style={{ marginTop: 14 }}>
        <div className="zr-avatar">E</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, color: "var(--text)" }}>Elena</div>
          <div style={{ fontSize: 11, color: "var(--text-mute)" }}>elena@marsh.studio</div>
        </div>
        <span style={{ color: "var(--text-faint)" }}>{I.chevD}</span>
      </div>
    </aside>
  );
}

function TopBar({ right }) {
  return (
    <div className="zr-top">
      <div style={{ flex: 1 }}></div>
      <div className="zr-top-right">
        {right}
      </div>
    </div>
  );
}

function Shell({ active, topRight, children }) {
  return (
    <div className="zr-app zr">
      <Sidebar active={active}/>
      <main className="zr-main">
        <TopBar right={topRight}/>
        <div className="zr-content">{children}</div>
      </main>
    </div>
  );
}

function MiniSpark({ values, color = "var(--accent)", h = 36 }) {
  const w = 100;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg className="zr-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sk" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sk)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

Object.assign(window, { Shell, Sidebar, TopBar, MiniSpark });
