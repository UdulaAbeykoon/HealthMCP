// Zenra — the Orb. SVG cloud-blue sphere with soft halo. state animates breathing/speaking.
export type OrbState = "idle" | "listening" | "thinking" | "speaking";

export function Orb({ size = 320, state = "idle" }: { size?: number; state?: OrbState }) {
  const cls =
    "zr-orb" +
    (state === "speaking" ? " is-speaking" : "") +
    (state === "thinking" ? " is-thinking" : "");
  return (
    <div className={cls} style={{ width: size, height: size }}>
      <div className="zr-orb-glow" />
      <svg viewBox="0 0 320 320" width={size} height={size} style={{ position: "relative", overflow: "visible" }}>
        <defs>
          <radialGradient id="orb-halo" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="#7E97F7" stopOpacity="0" />
            <stop offset="85%" stopColor="#7E97F7" stopOpacity=".18" />
            <stop offset="100%" stopColor="#7E97F7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb-base" cx="38%" cy="34%" r="68%">
            <stop offset="0%" stopColor="#F2F6FF" />
            <stop offset="35%" stopColor="#C8D6F7" />
            <stop offset="70%" stopColor="#7B97E2" />
            <stop offset="100%" stopColor="#4A6CF7" />
          </radialGradient>
          <radialGradient id="orb-wisp-1" cx="28%" cy="22%" r="40%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".85" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb-wisp-2" cx="76%" cy="40%" r="38%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".55" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb-wisp-3" cx="48%" cy="62%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".45" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb-depth" cx="68%" cy="72%" r="42%">
            <stop offset="0%" stopColor="#2A4BC2" stopOpacity=".45" />
            <stop offset="60%" stopColor="#2A4BC2" stopOpacity="0" />
          </radialGradient>
          <filter id="orb-cloud" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3" />
            <feColorMatrix values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 .9 0" />
            <feComposite in2="SourceGraphic" operator="in" />
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <clipPath id="orb-clip"><circle cx="160" cy="160" r="120" /></clipPath>
        </defs>
        <circle cx="160" cy="160" r="158" fill="url(#orb-halo)" />
        <g clipPath="url(#orb-clip)">
          <circle cx="160" cy="160" r="120" fill="url(#orb-base)" />
          <circle cx="160" cy="160" r="120" fill="url(#orb-depth)" />
          <rect x="40" y="40" width="240" height="240" filter="url(#orb-cloud)" opacity=".25" />
          <circle cx="160" cy="160" r="120" fill="url(#orb-wisp-1)" />
          <circle cx="160" cy="160" r="120" fill="url(#orb-wisp-2)" />
          <circle cx="160" cy="160" r="120" fill="url(#orb-wisp-3)" />
          <circle cx="160" cy="160" r="119" fill="none" stroke="#2C3F7E" strokeOpacity=".10" strokeWidth="2" />
        </g>
        <ellipse cx="128" cy="108" rx="38" ry="14" fill="white" opacity=".55" filter="url(#orb-cloud)" />
      </svg>
      <div className="zr-orb-shadow" />
    </div>
  );
}
