"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Proposal, ReasoningStep } from "./types";
import type { ActivityEntry } from "./store";

/** Play a line through ElevenLabs. Returns a controller with stop(). */
export function useVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    try {
      stop();
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return false;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => setSpeaking(false);
      setSpeaking(true);
      await audio.play();
      return true;
    } catch {
      setSpeaking(false);
      return false;
    }
  }, [stop]);

  useEffect(() => () => stop(), [stop]);
  return { speak, stop, speaking };
}

export interface ProposalsData {
  proposals: Proposal[];
  reasoning: ReasoningStep[];
  activity: ActivityEntry[];
}

export function useProposals() {
  const [data, setData] = useState<ProposalsData>({ proposals: [], reasoning: [], activity: [] });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/proposals");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const act = useCallback(async (id: string, action: string, body?: Record<string, unknown>) => {
    const res = await fetch(`/api/proposals/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const json = await res.json();
    await refresh();
    return json;
  }, [refresh]);

  const orchestrate = useCallback(async (focus?: string) => {
    setLoading(true);
    await fetch("/api/orchestrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focus }),
    });
    await refresh();
  }, [refresh]);

  return { ...data, loading, refresh, act, orchestrate };
}

/** Browser speech-to-text via the Web Speech API (Chrome). */
export function useSpeechInput(onResult: (text: string) => void) {
  const recRef = useRef<unknown>(null);
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const toggle = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    if (recording) {
      (recRef.current as { stop: () => void } | null)?.stop();
      setRecording(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e: { results: { 0: { transcript: string } }[] }) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    recRef.current = rec;
    rec.start();
    setRecording(true);
  }, [recording, onResult]);

  return { toggle, recording, supported };
}
