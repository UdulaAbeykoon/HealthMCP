// Real Apple Health data → typed exports + VITALS shape the screens consume.
// Source JSON is produced by .data/parse.mjs from the user's export.xml.
import raw from "./health-data.json";

export const HEALTH = raw as HealthData;

export interface HealthData {
  generatedAt: string;
  source: string;
  profile: { dob: string; sex: string; age: number };
  latest: {
    date: string; restingHr: number; hrv: number; hrvBaseline: number;
    respiratory: number; spo2: number; wristTemp: number; vo2max: number;
    steps: number; activeEnergy: number;
  };
  recovery: { score: number; rings: { autonomic: number; sleepLoad: number; strain: number } };
  series: {
    hrv14: number[]; hrvSmall: number[]; restingHr7: number[]; respiratory7: number[];
    spo2_7: number[]; wristTemp7: number[]; vo2_7: number[]; steps14: number[];
    activeEnergy7: number[]; readiness7: number[]; sleepBars: number[];
  };
  sleep: {
    lastNight: {
      date: string; asleep: number; inbed: number; awake: number; deep: number; rem: number; core: number;
      eff: number; inBedClock: string | null; wokeClock: string | null; asleepLabel: string;
    } | null;
    hypnogram: number[];
    nights14: { date: string; asleep: number; inbed: number; awake: number; deep: number; rem: number; core: number; eff: number }[];
  };
  workouts: { type: string; date: string; durationMin: number; distanceKm: number; energyKcal: number }[];
  lifetime: { totalWorkouts: number; totalDistanceKm: number; totalStepsM: number; ecgCount: number; mindfulMin: number; daysTracked: number; firstDay: string };
}

const to12h = (hhmm: string | null): string => {
  if (!hhmm) return "—";
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ap}`;
};
const fmtMin = (min: number) => `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, "0")}m`;
const recoveryLabel = (s: number) => (s >= 85 ? "Strong" : s >= 70 ? "Good" : s >= 55 ? "Fair" : "Low");

export function buildVitals() {
  const { latest, sleep, series, recovery } = HEALTH;
  const ln = sleep.lastNight;
  const asleep = ln?.asleep ?? 420;
  const stageColor = { deep: "var(--accent-2)", rem: "var(--ag-iris)", light: "var(--ag-lyra)", awake: "var(--text-mute)" };
  const pct = (v: number) => Math.round((v / asleep) * 100);

  // 12 decorative depth bars from the real hypnogram (deeper sleep = taller)
  const hyp = sleep.hypnogram.length ? sleep.hypnogram : [2, 2, 3, 2, 1, 2, 3, 2, 2, 1, 2, 0];
  const step = Math.max(1, Math.ceil(hyp.length / 12));
  const depth = [0.28, 0.55, 0.72, 1.0]; // awake, rem, light, deep
  const bars = hyp.filter((_, i) => i % step === 0).slice(0, 12).map((s) => depth[s] ?? 0.6);

  const stepGoal = 10000;

  return {
    sleep: {
      asleepLabel: ln?.asleepLabel ?? fmtMin(asleep),
      hours: Math.floor(asleep / 60),
      minutes: Math.round(asleep % 60),
      inBed: to12h(ln?.inBedClock ?? null),
      woke: to12h(ln?.wokeClock ?? null),
      efficiency: ln?.eff ?? 90,
      bars,
      stages: [
        { k: "Deep", v: fmtMin(ln?.deep ?? 0), p: pct(ln?.deep ?? 0), color: stageColor.deep },
        { k: "REM", v: fmtMin(ln?.rem ?? 0), p: pct(ln?.rem ?? 0), color: stageColor.rem },
        { k: "Light", v: fmtMin(ln?.core ?? 0), p: pct(ln?.core ?? 0), color: stageColor.light },
        { k: "Awake", v: fmtMin(ln?.awake ?? 0), p: pct(ln?.awake ?? 0), color: stageColor.awake },
      ],
      hypnogram: hyp,
    },
    recovery: { score: recovery.score, label: recoveryLabel(recovery.score), note: `HRV ${latest.hrv}ms vs ${latest.hrvBaseline} baseline` },
    hrv: { value: latest.hrv, baseline: latest.hrvBaseline, unit: "ms", series: series.hrvSmall },
    hrv14: series.hrv14,
    steps: { value: latest.steps, goalPct: Math.min(100, Math.round((latest.steps / stepGoal) * 100)) },
    restingHr: latest.restingHr,
    readiness7: series.readiness7,
    recoveryRings: [
      { label: "Autonomic", v: recovery.rings.autonomic, color: "var(--ag-sage)", note: "HRV-driven" },
      { label: "Sleep load", v: recovery.rings.sleepLoad, color: "var(--ag-lyra)", note: "Last night" },
      { label: "Strain", v: recovery.rings.strain, color: "var(--ag-atlas)", note: "Today so far" },
    ],
    bodySignals: [
      { k: "Resting HR", v: `${latest.restingHr} bpm`, t: "median · 7d", chart: series.restingHr7 },
      { k: "Respiratory rate", v: `${latest.respiratory} /m`, t: "stable", chart: series.respiratory7 },
      { k: "SpO₂ avg", v: `${latest.spo2}%`, t: "normal range", chart: series.spo2_7 },
      { k: "Wrist temp (sleep)", v: `${latest.wristTemp}°C`, t: "within range", chart: series.wristTemp7 },
      { k: "VO₂ max (est.)", v: `${latest.vo2max}`, t: `strong for age ${HEALTH.profile.age}`, chart: series.vo2_7 },
    ],
  };
}

export const WORKOUTS = HEALTH.workouts;
export const LIFETIME = HEALTH.lifetime;
export const PROFILE = HEALTH.profile;
