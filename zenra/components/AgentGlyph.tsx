import { AGENTS, type AgentId } from "@/lib/agents";
import type { CSSProperties } from "react";

export function GlyphSvg({ id }: { id: AgentId }) {
  switch (id) {
    case "sage":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M4 16c2-4 6-4 8 0s6 4 8 0" />
          <path d="M4 11c2-4 6-4 8 0s6 4 8 0" opacity=".55" />
        </svg>
      );
    case "lyra":
      return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 4a8 8 0 1 0 4 14A7 7 0 0 1 16 4z" /></svg>;
    case "atlas":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
          <path d="M3 19l6-10 4 6 3-4 5 8z" />
        </svg>
      );
    case "orchid":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "echo":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="6" opacity=".55" /><circle cx="12" cy="12" r="9.5" opacity=".25" />
        </svg>
      );
    case "fern":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M5 19c10-1 14-5 15-15-10 1-14 5-15 15z" /><path d="M5 19l9-9" />
        </svg>
      );
    case "iris":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

export function AgentGlyph({ agent, size = "md" }: { agent: AgentId; size?: "md" | "lg" | "xl" }) {
  const a = AGENTS[agent];
  const cls = "zr-glyph" + (size === "lg" ? " lg" : size === "xl" ? " xl" : "");
  return (
    <span className={cls} style={{ ["--ag" as keyof CSSProperties]: a.color } as CSSProperties} aria-label={a.name}>
      <GlyphSvg id={agent} />
    </span>
  );
}
