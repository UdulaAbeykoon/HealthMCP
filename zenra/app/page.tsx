"use client";

import { useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { Orb, type OrbState } from "@/components/Orb";
import { I } from "@/components/Icons";
import { AGENTS, type AgentId } from "@/lib/agents";
import { USER, VITALS } from "@/lib/seed";
import { useVoice, useSpeechInput } from "@/lib/client";
import type { ChatMessage } from "@/lib/types";
import { AnimatedNumber, Reveal, AnimatedRing } from "@/components/anim";
import { Agenda } from "@/components/Agenda";

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
  const [voiceOn, setVoiceOn] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const { speak, stop, speaking } = useVoice();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggle: toggleMic, recording, supported: micSupported } = useSpeechInput((t) => send(t, undefined, true));

  const orbState: OrbState = speaking ? "speaking" : recording ? "listening" : thinking ? "thinking" : "idle";
  const lastAnswer = [...messages].reverse().find((m) => m.role === "assistant");

  // Tap the orb to talk: stop playback if it's speaking, otherwise start/stop listening.
  function handleOrbClick() {
    if (speaking) { stop(); return; }
    if (thinking) return;
    if (micSupported) { setVoiceOn(true); toggleMic(); }
    else inputRef.current?.focus();
  }
  const orbLabel = speaking ? "Tap to stop" : recording ? "Tap to stop listening" : "Tap to talk";

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
        {/* center column — orb-first: the answer IS the orb pulsing + speaking */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18, minWidth: 0 }}>
          <h1 className="zr-serif" style={{ fontSize: 44, textAlign: "center", letterSpacing: "-0.01em", marginBottom: 6 }}>
            Good morning, {USER.name}
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: 16, textAlign: "center", maxWidth: 460 }}>
            Your team has already shaped the day around how you slept. Ask me anything.
          </p>

          <div style={{ marginTop: 22 }}>
            <Orb size={300} state={orbState} onClick={handleOrbClick} label={orbLabel} />
          </div>

          <button className="zr-listen zr-press" onClick={handleOrbClick} style={{ marginTop: 6, cursor: "pointer" }}>
            {orbState !== "idle" ? (
              <span className="zr-listen-bars"><span /><span /><span /><span /><span /></span>
            ) : (
              <span style={{ color: "var(--accent)", width: 14, height: 14, display: "grid", placeItems: "center" }}>{I.mic}</span>
            )}
            {orbState === "listening" ? "Listening… tap to stop"
              : orbState === "thinking" ? "Thinking…"
              : orbState === "speaking" ? "Speaking… tap to stop"
              : micSupported ? "Tap the orb to talk" : "Type below to chat"}
          </button>

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="zr-btn primary sm zr-press" onClick={playBriefing} disabled={thinking || speaking}>
              <span style={{ width: 15, height: 15 }}>{I.speaker}</span> Play this morning&apos;s briefing
            </button>
            {messages.length > 0 && (
              <button className="zr-btn sm zr-press" onClick={() => setShowHistory(true)}>
                <span style={{ width: 14, height: 14 }}>{I.feed}</span> View conversation
                <span style={{ marginLeft: 2, fontSize: 11, color: "var(--text-mute)" }}>({messages.length})</span>
              </button>
            )}
          </div>

          <div style={{ width: "100%", maxWidth: 640, marginTop: 32 }}>
            {messages.length === 0 && (
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
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message your team, or tap the orb to talk…" />
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
              Spoken answers, private conversation. Not medical advice.
            </div>
          </div>
        </div>

        {/* right rail */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <Reveal delay={0}><Agenda /></Reveal>
          <Reveal delay={70}><SleepCard /></Reveal>
          <Reveal delay={140}><RecoveryCard /></Reveal>
          <Reveal delay={210}><HRVCard /></Reveal>
          <Reveal delay={280}><StepsCard /></Reveal>
        </div>
      </div>

      {showHistory && (
        <ConversationHistory
          messages={messages}
          onClose={() => setShowHistory(false)}
          onClear={() => { stop(); setMessages([]); setShowHistory(false); }}
          onReplay={(text) => speak(text)}
        />
      )}
    </Shell>
  );
}

function ConversationHistory({ messages, onClose, onClear, onReplay }: {
  messages: ChatMessage[];
  onClose: () => void;
  onClear: () => void;
  onReplay: (text: string) => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "color-mix(in oklab, var(--bg), transparent 25%)",
        backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 24,
      }}
      className="zr-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="zr-card elev zr-pop"
        style={{ width: "100%", maxWidth: 640, maxHeight: "82vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
          <span className="zr-serif" style={{ fontSize: 22 }}>Your conversation</span>
          <span style={{ fontSize: 12, color: "var(--text-mute)" }}>{messages.length} messages</span>
          <button className="zr-btn ghost sm zr-press" style={{ marginLeft: "auto" }} onClick={onClear}>Clear</button>
          <button className="zr-btn icon sm zr-press" aria-label="Close" onClick={onClose}>
            <span style={{ width: 16, height: 16 }}>{I.x}</span>
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} className={`zr-bubble ${m.role === "user" ? "user" : "agent"}`}>
              {m.role === "assistant" && m.agent && (
                <div style={{ fontSize: 11, color: AGENTS[m.agent].color, marginBottom: 4 }}>{AGENTS[m.agent].name} · {AGENTS[m.agent].role}</div>
              )}
              {m.content}
              {m.role === "assistant" && (
                <button className="zr-btn ghost sm zr-press" onClick={() => onReplay(m.content)}
                  style={{ display: "flex", marginTop: 8, padding: "2px 8px", fontSize: 11, color: "var(--accent)" }}>
                  <span style={{ width: 13, height: 13 }}>{I.speaker}</span> Replay
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
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
