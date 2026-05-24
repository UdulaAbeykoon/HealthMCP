"use client";

import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { Orb, type OrbState } from "@/components/Orb";
import { I } from "@/components/Icons";
import { AGENTS, type AgentId } from "@/lib/agents";
import { USER, VITALS } from "@/lib/seed";
import { useVoice, useSpeechInput } from "@/lib/client";
import type { ChatMessage } from "@/lib/types";
import { AnimatedNumber, Reveal, AnimatedRing } from "@/components/anim";

const SUGGESTIONS: { icon: keyof typeof I; color: string; text: string; agent?: AgentId }[] = [
  { icon: "moon", color: "var(--ag-lyra)", text: "How did I sleep last night?", agent: "lyra" },
  { icon: "bolt", color: "var(--ag-atlas)", text: "What can I do to boost energy?", agent: "atlas" },
  { icon: "metrics", color: "var(--ag-sage)", text: "Is my recovery on track?", agent: "sage" },
  { icon: "meal", color: "var(--ag-fern)", text: "How should I eat around my workout?", agent: "fern" },
];

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const { speak, stop, speaking } = useVoice();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toggle: toggleMic, recording, supported: micSupported } = useSpeechInput((t) => send(t, undefined, true));

  const orbState: OrbState = speaking ? "speaking" : recording ? "listening" : thinking ? "thinking" : "idle";
  const hasChat = messages.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function send(text: string, agent?: AgentId, autoSpeak?: boolean) {
    const content = text.trim();
    if (!content || thinking) return;
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })), agent }),
      });
      const data = await res.json();
      const reply: string = data.reply ?? "…";
      setMessages((m) => [...m, { role: "assistant", content: reply, agent }]);
      if (voiceOn || autoSpeak) speak(reply);
    } finally {
      setThinking(false);
    }
  }

  async function playBriefing() {
    setThinking(true);
    try {
      const res = await fetch("/api/briefing");
      const { text } = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: text }]);
      speak(text);
    } finally {
      setThinking(false);
    }
  }

  return (
    <Shell
      topRight={
        <button className="zr-btn" onClick={() => { const n = !voiceOn; setVoiceOn(n); if (!n) stop(); }}
          style={{ color: voiceOn ? "var(--accent)" : "var(--text-dim)", border: voiceOn ? "1px solid var(--accent-soft-2)" : undefined }}>
          <span style={{ width: 16, height: 16 }}>{I.bolt}</span>
          {voiceOn ? "Voice on" : "Voice off"}
        </button>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28, paddingTop: 6, alignItems: "start" }}>
        {/* center column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: hasChat ? 0 : 24, minWidth: 0 }}>
          {!hasChat && (
            <>
              <h1 className="zr-serif" style={{ fontSize: 44, textAlign: "center", letterSpacing: "-0.01em", marginBottom: 6 }}>
                Good morning, {USER.name}
              </h1>
              <p style={{ color: "var(--text-dim)", fontSize: 16, textAlign: "center", maxWidth: 460 }}>
                Your team has already shaped the day around how you slept. Ask me anything.
              </p>
              <div style={{ marginTop: 24 }}>
                <Orb size={300} state={orbState} />
              </div>
              <div className="zr-listen" style={{ marginTop: 8 }}>
                {orbState !== "idle" ? (
                  <span className="zr-listen-bars"><span /><span /><span /><span /><span /></span>
                ) : (
                  <span style={{ color: "var(--accent)", width: 14, height: 14, display: "grid", placeItems: "center" }}>{I.spark}</span>
                )}
                {orbState === "listening" ? "Listening…" : orbState === "thinking" ? "Thinking…" : orbState === "speaking" ? "Speaking…" : "Ready when you are"}
              </div>
              <button className="zr-btn primary sm zr-press" style={{ marginTop: 18 }} onClick={playBriefing} disabled={thinking}>
                <span style={{ width: 15, height: 15 }}>{I.speaker}</span> Play this morning&apos;s briefing
              </button>
            </>
          )}

          {hasChat && (
            <div style={{ width: "100%", maxWidth: 720, display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <Orb size={64} state={orbState} />
              <div>
                <div className="zr-serif" style={{ fontSize: 22 }}>Zenra</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  {orbState === "thinking" ? "thinking…" : orbState === "speaking" ? "speaking…" : "your energy team"}
                </div>
              </div>
              <button className="zr-btn ghost sm" style={{ marginLeft: "auto" }} onClick={() => { stop(); setMessages([]); }}>New chat</button>
            </div>
          )}

          {hasChat && (
            <div ref={scrollRef} style={{ width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", gap: 12, maxHeight: "52vh", overflowY: "auto", padding: "8px 4px 16px" }}>
              {messages.map((m, i) => (
                <div key={i} className={`zr-bubble ${m.role === "user" ? "user" : "agent"} zr-fade-in`}>
                  {m.role === "assistant" && m.agent && (
                    <div style={{ fontSize: 11, color: AGENTS[m.agent].color, marginBottom: 4 }}>{AGENTS[m.agent].name} · {AGENTS[m.agent].role}</div>
                  )}
                  {m.content}
                </div>
              ))}
              {thinking && (
                <div className="zr-bubble agent"><span className="zr-typing"><span /><span /><span /></span></div>
              )}
            </div>
          )}

          <div style={{ width: "100%", maxWidth: 720, marginTop: hasChat ? 8 : 40 }}>
            {!hasChat && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="zr-sugg zr-press" onClick={() => send(s.text, s.agent)}>
                    <span className="zr-sugg-ic" style={{ background: `color-mix(in oklab, ${s.color}, white 86%)`, color: s.color }}>
                      <span style={{ width: 14, height: 14 }}>{I[s.icon]}</span>
                    </span>
                    <span style={{ lineHeight: 1.3 }}>{s.text}</span>
                  </button>
                ))}
              </div>
            )}

            <form className="zr-msg" onSubmit={(e) => { e.preventDefault(); send(input); }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message your team, or tap the mic to talk…" />
              {micSupported && (
                <button type="button" className={"zr-msg-mic zr-press" + (recording ? " is-recording" : "")} onClick={toggleMic} aria-label="Talk" style={{ width: 40, height: 40 }}>
                  <span style={{ width: 18, height: 18 }}>{I.mic}</span>
                </button>
              )}
              <button type="submit" className="zr-msg-mic zr-press" aria-label="Send" disabled={!input.trim()}>
                <span style={{ width: 18, height: 18 }}>{I.arrow}</span>
              </button>
            </form>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 14, color: "var(--text-mute)", fontSize: 12 }}>
              <span style={{ width: 12, height: 12, display: "grid", placeItems: "center" }}>{I.lock}</span>
              Your conversations are private. Not medical advice.
            </div>
          </div>
        </div>

        {/* right rail */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <Reveal delay={0}><SleepCard /></Reveal>
          <Reveal delay={70}><RecoveryCard /></Reveal>
          <Reveal delay={140}><HRVCard /></Reveal>
          <Reveal delay={210}><StepsCard /></Reveal>
        </div>
      </div>
    </Shell>
  );
}

function SleepCard() {
  const s = VITALS.sleep;
  return (
    <div className="zr-card zr-metric zr-lift">
      <div className="zr-eyebrow"><span style={{ width: 14, height: 14, color: "var(--ag-lyra)" }}>{I.moon}</span> Sleep</div>
      <div style={{ marginTop: 8 }}>
        <AnimatedNumber value={s.hours} className="v" /><span className="u">h</span>
        <AnimatedNumber value={s.minutes} className="v" style={{ marginLeft: 8 }} /><span className="u">m</span>
      </div>
      <div style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 2 }}>Today</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56, marginTop: 16 }}>
        {s.bars.map((v, i) => (
          <div
            key={i}
            className="zr-grow"
            style={{
              flex: 1,
              height: `${v * 100}%`,
              background: i > 7 ? "var(--accent)" : "color-mix(in oklab, var(--accent), white 60%)",
              borderRadius: 2,
              opacity: 0.9,
              animationDelay: `${i * 45}ms`,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-mute)", marginTop: 8 }} className="zr-mono">
        <span>{s.inBed}</span><span>{s.woke}</span>
      </div>
    </div>
  );
}

function RecoveryCard() {
  const r = VITALS.recovery;
  return (
    <div className="zr-card zr-metric zr-lift">
      <div className="zr-eyebrow"><span style={{ width: 14, height: 14, color: "var(--accent)" }}>{I.spark}</span> Recovery</div>
      <div style={{ marginTop: 14, marginInline: "auto", width: 100 }}>
        <AnimatedRing value={r.score} size={100}>
          <span className="zr-serif" style={{ fontSize: 26 }}>
            <AnimatedNumber value={r.score} suffix="%" />
          </span>
        </AnimatedRing>
      </div>
      <div style={{ textAlign: "center", marginTop: 6, color: "var(--accent)", fontSize: 12 }}>{r.label}</div>
      <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-mute)", marginTop: 4 }}>{r.note}</div>
    </div>
  );
}

function HRVCard() {
  const data = VITALS.hrv.series;
  const W = 220, H = 40;
  const max = Math.max(...data), min = Math.min(...data);
  const xOf = (i: number) => (i / (data.length - 1)) * W;
  const yOf = (v: number) => H - ((v - min) / (max - min || 1)) * (H - 6) - 3;
  const pts = data.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");
  return (
    <div className="zr-card zr-metric zr-lift">
      <div className="zr-eyebrow"><span style={{ width: 14, height: 14, color: "var(--ag-sage)" }}>{I.metrics}</span> HRV</div>
      <div style={{ marginTop: 8 }}><AnimatedNumber value={VITALS.hrv.value} className="v" /><span className="u">ms</span></div>
      <div style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 2 }}>Baseline {VITALS.hrv.baseline} ms</div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ marginTop: 14 }}>
        <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5" pathLength="1" className="zr-draw" />
        <circle cx={xOf(data.length - 1)} cy={yOf(data[data.length - 1])} r="3" fill="var(--accent)" />
      </svg>
    </div>
  );
}

function StepsCard() {
  return (
    <div className="zr-card zr-metric zr-lift">
      <div className="zr-eyebrow"><span style={{ width: 14, height: 14, color: "var(--ag-atlas)" }}>{I.bolt}</span> Steps</div>
      <div style={{ marginTop: 8 }}>
        <AnimatedNumber value={VITALS.steps.value} className="v" format={(n) => Math.round(n).toLocaleString()} />
      </div>
      <div style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 2 }}>Today</div>
      <div className="zr-bar-track" style={{ marginTop: 16, height: 5 }}>
        <div className="zr-bar-fill" style={{ width: `${VITALS.steps.goalPct}%` }} />
      </div>
      <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 8 }}>{VITALS.steps.goalPct}% of goal</div>
    </div>
  );
}
