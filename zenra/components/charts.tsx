// Small pure-SVG chart primitives shared across screens.

export function MiniSpark({ values, color = "var(--accent)", h = 36 }: { values: number[]; color?: string; h?: number }) {
  const w = 100;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  const id = `sk-${color.replace(/[^a-z0-9]/gi, "")}-${h}`;
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg className="zr-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function Ring({ value, size = 100, stroke = 6, color = "var(--accent)", track, children }: {
  value: number; size?: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode;
}) {
  const r = size / 2 - stroke - 4;
  const C = 2 * Math.PI * r;
  const filled = C * Math.min(1, value / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track ?? "color-mix(in oklab, var(--accent), white 85%)"} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${filled} ${C - filled}`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
    </div>
  );
}

export function Pill({ children, variant, style }: { children: React.ReactNode; variant?: "accent" | "positive" | "warn" | "ghost"; style?: React.CSSProperties }) {
  return <span className={"zr-pill" + (variant ? ` ${variant}` : "")} style={style}>{children}</span>;
}
