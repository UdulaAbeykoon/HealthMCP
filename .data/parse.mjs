// Streaming parser for Apple Health export.xml → compact health-data.json
import fs from "node:fs";
import readline from "node:readline";

const SRC = new URL("./apple_health_export/export.xml", import.meta.url);
const OUT = new URL("../zenra/lib/health-data.json", import.meta.url);

// normalize "2026-05-23 23:15:30 -0400" → "2026-05-23T23:15:30-04:00"
function toDate(s) {
  if (!s) return null;
  const m = s.match(/^(\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d) ([+-]\d\d)(\d\d)$/);
  if (!m) return new Date(s);
  return new Date(`${m[1]}T${m[2]}${m[3]}:${m[4]}`);
}
const dayKey = (s) => (s ? s.slice(0, 10) : null);
const attr = (line, name) => {
  const m = line.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : null;
};

// daily accumulators
const sum = {}, cnt = {};            // metric → {date → value}
const add = (metric, date, v, mode = "sum") => {
  sum[metric] ??= {}; cnt[metric] ??= {};
  if (mode === "sum") sum[metric][date] = (sum[metric][date] ?? 0) + v;
  else { sum[metric][date] = (sum[metric][date] ?? 0) + v; cnt[metric][date] = (cnt[metric][date] ?? 0) + 1; }
};

// sleep nights: nightKey(wake date) → {stageMin}
const nights = {};
const STAGE = { Awake: "awake", AsleepREM: "rem", AsleepCore: "core", AsleepDeep: "deep", AsleepUnspecified: "core", InBed: "inbed" };
let lastSleepSegs = []; // [{stage,start,durMin}] for most-recent night, filled after

const sleepSegments = []; // {nk, stage, s(ms), e(ms), sc, ec}

const workouts = [];
let ecgCount = 0, mindfulMin = 0;

const rl = readline.createInterface({ input: fs.createReadStream(SRC), crlfDelay: Infinity });
let n = 0;

for await (const line of rl) {
  n++;
  if (line.indexOf("<Record ") === -1 && line.indexOf("<Workout ") === -1) continue;

  if (line.indexOf("<Workout ") !== -1) {
    workouts.push({
      type: (attr(line, "workoutActivityType") || "").replace("HKWorkoutActivityType", ""),
      start: attr(line, "startDate"),
      durationMin: Math.round(parseFloat(attr(line, "duration") || "0")),
      distanceKm: parseFloat(attr(line, "totalDistance") || "0") || 0,
      energyKcal: Math.round(parseFloat(attr(line, "totalEnergyBurned") || "0")) || 0,
    });
    continue;
  }

  const type = attr(line, "type");
  if (!type) continue;
  const t = type.replace("HKQuantityTypeIdentifier", "").replace("HKCategoryTypeIdentifier", "");
  const start = attr(line, "startDate");
  const d = dayKey(start);
  const val = parseFloat(attr(line, "value"));

  switch (t) {
    case "StepCount": if (!isNaN(val)) add("steps", d, val); break;
    case "ActiveEnergyBurned": if (!isNaN(val)) add("activeEnergy", d, val); break;
    case "DistanceWalkingRunning": if (!isNaN(val)) add("distance", d, val); break;
    case "RestingHeartRate": if (!isNaN(val)) add("restingHr", d, val, "avg"); break;
    case "HeartRateVariabilitySDNN": if (!isNaN(val)) add("hrv", d, val, "avg"); break;
    case "RespiratoryRate": if (!isNaN(val)) add("respiratory", d, val, "avg"); break;
    case "OxygenSaturation": if (!isNaN(val)) add("spo2", d, val * 100, "avg"); break;
    case "AppleSleepingWristTemperature": if (!isNaN(val)) add("wristTemp", d, val, "avg"); break;
    case "VO2Max": if (!isNaN(val)) add("vo2max", d, val, "avg"); break;
    case "FlightsClimbed": if (!isNaN(val)) add("flights", d, val); break;
    case "AppleExerciseTime": if (!isNaN(val)) add("exerciseMin", d, val); break;
    case "HeartRate": if (!isNaN(val)) add("hrAvg", d, val, "avg"); break;
    case "MindfulSession": {
      const e = toDate(attr(line, "endDate")), s = toDate(start);
      if (s && e) mindfulMin += (e - s) / 60000;
      break;
    }
    case "SleepAnalysis": {
      const raw = (attr(line, "value") || "").replace("HKCategoryValueSleepAnalysis", "");
      const stage = STAGE[raw];
      if (!stage) break;
      const s = toDate(start), e = toDate(attr(line, "endDate"));
      if (!s || !e) break;
      const durMin = (e - s) / 60000;
      const sh = s.getHours();
      // night key = wake date: evening segments roll into next day
      const nd = new Date(s); if (sh >= 18) nd.setDate(nd.getDate() + 1);
      const nk = nd.toISOString().slice(0, 10);
      sleepSegments.push({ nk, stage, s: +s, e: +e, durMin, sc: start.slice(11, 16), ec: attr(line, "endDate").slice(11, 16) });
      void durMin;
      break;
    }
  }
}

// ── derive ──────────────────────────────────────────────────────────
const sortedDays = (m) => Object.keys(sum[m] ?? {}).sort();
const avgSeries = (m, days) => days.map((d) => Math.round((sum[m][d] / (cnt[m][d] || 1)) * 10) / 10);
const sumSeries = (m, days) => days.map((d) => Math.round(sum[m][d]));
const lastN = (arr, k) => arr.slice(-k);

function dailyAvg(m) { const ds = sortedDays(m); return ds.map((d) => ({ d, v: sum[m][d] / (cnt[m][d] || 1) })); }
function dailySum(m) { const ds = sortedDays(m); return ds.map((d) => ({ d, v: sum[m][d] })); }

const hrvDaily = dailyAvg("hrv");
const restDaily = dailyAvg("restingHr");
const stepsDaily = dailySum("steps");
const respDaily = dailyAvg("respiratory");
const spo2Daily = dailyAvg("spo2");
const tempDaily = dailyAvg("wristTemp");
const vo2Daily = dailyAvg("vo2max");
const energyDaily = dailySum("activeEnergy");

const round = (x, p = 0) => { const f = 10 ** p; return Math.round(x * f) / f; };
const last = (a) => (a.length ? a[a.length - 1] : null);
const median = (a) => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const med7 = (daily) => round(median(lastN(daily.map((x) => x.v), 7)), 1);
// merge overlapping intervals → minutes (handles multiple devices double-logging sleep)
function unionMin(segs) {
  if (!segs.length) return 0;
  const arr = segs.slice().sort((a, b) => a.s - b.s);
  let total = 0, cs = arr[0].s, ce = arr[0].e;
  for (let i = 1; i < arr.length; i++) {
    const it = arr[i];
    if (it.s > ce) { total += ce - cs; cs = it.s; ce = it.e; }
    else if (it.e > ce) ce = it.e;
  }
  total += ce - cs;
  return total / 60000;
}

// HRV
const hrvVals = hrvDaily.map((x) => x.v);
const hrvBaseline = round(hrvVals.reduce((a, b) => a + b, 0) / (hrvVals.length || 1));
const hrvLatest = last(hrvDaily);
const hrv14 = lastN(hrvDaily, 14).map((x) => round(x.v));

// sleep nights — union overlapping segments per night
void nights;
const byNight = {};
for (const seg of sleepSegments) (byNight[seg.nk] ??= []).push(seg);
const nightStats = Object.keys(byNight).sort().map((k) => {
  const segs = byNight[k];
  const asleep = Math.round(unionMin(segs.filter((x) => x.stage !== "awake" && x.stage !== "inbed")));
  const deep = Math.round(unionMin(segs.filter((x) => x.stage === "deep")));
  const rem = Math.round(unionMin(segs.filter((x) => x.stage === "rem")));
  // "Core" often spans the whole night alongside detailed Deep/REM — make stages exclusive
  const core = Math.max(0, asleep - deep - rem);
  const awake = Math.round(unionMin(segs.filter((x) => x.stage === "awake")));
  const all = segs.filter((x) => x.stage !== "inbed");
  const span = all.length ? (Math.max(...all.map((x) => x.e)) - Math.min(...all.map((x) => x.s))) / 60000 : asleep + awake;
  const inbed = Math.round(Math.max(span, asleep + awake));
  const eff = inbed ? Math.min(100, round((asleep / inbed) * 100)) : 0;
  return { date: k, asleep, inbed, awake, deep, rem, core, eff };
}).filter((x) => x.asleep > 180);
const lastNight = last(nightStats);

// hypnogram for last night: ordered segments → stage indices (0 awake,1 rem,2 light,3 deep)
const segIdx = { awake: 0, rem: 1, core: 2, deep: 3 };
let hypnogram = [], inBedClock = null, wokeClock = null;
if (lastNight) {
  const segs = sleepSegments.filter((s) => s.nk === lastNight.date && s.stage !== "inbed").sort((a, b) => a.s - b.s);
  if (segs.length) { inBedClock = segs[0].sc; wokeClock = segs[segs.length - 1].ec; }
  // sample into ~40 buckets weighted by duration
  const expanded = [];
  for (const s of segs) { const reps = Math.max(1, Math.round(s.durMin / 8)); for (let i = 0; i < reps; i++) expanded.push(segIdx[s.stage]); }
  hypnogram = expanded.length > 48 ? expanded.filter((_, i) => i % Math.ceil(expanded.length / 48) === 0) : expanded;
}

// recovery proxy: blend HRV-vs-baseline + sleep efficiency
function recoveryFor(nightDate, hrvForDay) {
  const effPart = lastNight ? Math.min(100, lastNight.eff) : 70;
  const hrvPart = hrvBaseline ? Math.min(120, (hrvForDay / hrvBaseline) * 100) : 75;
  return Math.round(Math.max(20, Math.min(99, 0.5 * hrvPart + 0.5 * effPart)));
}
const recoveryScore = recoveryFor(lastNight?.date, med7(hrvDaily) || hrvBaseline);
// readiness over last 7 nights
const readiness7 = lastN(nightStats, 7).map((nt) => {
  const h = hrvDaily.find((x) => x.d === nt.date)?.v ?? hrvBaseline;
  const hrvPart = hrvBaseline ? Math.min(120, (h / hrvBaseline) * 100) : 75;
  return Math.round(Math.max(20, Math.min(99, 0.5 * hrvPart + 0.5 * Math.min(100, nt.eff))));
});

const totalSteps = Object.values(sum.steps ?? {}).reduce((a, b) => a + b, 0);
const totalDistance = Object.values(sum.distance ?? {}).reduce((a, b) => a + b, 0);

const out = {
  generatedAt: new Date().toISOString(),
  source: "Apple Health export",
  profile: { dob: "2006-03-21", sex: "Male", age: 2026 - 2006 },
  latest: {
    date: lastNight?.date ?? last(stepsDaily)?.d,
    // robust headline values: median of last 7 days (single noisy readings don't skew)
    restingHr: round(med7(restDaily)),
    hrv: round(med7(hrvDaily)),
    hrvBaseline,
    respiratory: med7(respDaily),
    spo2: round(med7(spo2Daily)),
    wristTemp: round(med7(tempDaily), 1),
    vo2max: round(last(vo2Daily)?.v ?? 0, 1),
    steps: Math.round(last(stepsDaily)?.v ?? 0),
    activeEnergy: Math.round(last(energyDaily)?.v ?? 0),
  },
  recovery: {
    score: recoveryScore,
    rings: (() => {
      const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, Math.round(x)));
      const autonomic = clamp((med7(hrvDaily) / (hrvBaseline || 1)) * 85, 30, 99);
      const sleepLoad = clamp(((lastNight?.asleep ?? 420) / 480) * 100, 30, 100);
      const energyVals = energyDaily.map((x) => x.v);
      const energyAvg = energyVals.reduce((a, b) => a + b, 0) / (energyVals.length || 1);
      const strain = clamp((median(lastN(energyVals, 7)) / (energyAvg || 1)) * 70, 20, 99);
      return { autonomic, sleepLoad, strain };
    })(),
  },
  series: {
    hrv14,
    hrvSmall: lastN(hrvVals.map((v) => round(v)), 12),
    restingHr7: lastN(restDaily.map((x) => round(x.v)), 7),
    respiratory7: lastN(respDaily.map((x) => round(x.v, 1)), 7),
    spo2_7: lastN(spo2Daily.map((x) => round(x.v)), 7),
    wristTemp7: lastN(tempDaily.map((x) => round(x.v, 1)), 7),
    vo2_7: lastN(vo2Daily.map((x) => round(x.v, 1)), 7),
    steps14: lastN(stepsDaily.map((x) => Math.round(x.v)), 14),
    activeEnergy7: lastN(energyDaily.map((x) => Math.round(x.v)), 7),
    readiness7,
    sleepBars: lastN(nightStats.map((nt) => round(nt.eff / 100, 2)), 12),
  },
  sleep: {
    lastNight: lastNight && {
      ...lastNight,
      inBedClock, wokeClock,
      asleepLabel: `${Math.floor(lastNight.asleep / 60)}h ${Math.round(lastNight.asleep % 60)}m`,
    },
    hypnogram,
    nights14: lastN(nightStats, 14),
  },
  workouts: workouts.filter((w) => w.start).sort((a, b) => (a.start < b.start ? 1 : -1)).slice(0, 12).map((w) => ({
    type: w.type, date: w.start.slice(0, 10), durationMin: w.durationMin,
    distanceKm: round(w.distanceKm, 2), energyKcal: w.energyKcal,
  })),
  lifetime: {
    totalWorkouts: workouts.length,
    totalDistanceKm: round(totalDistance),
    totalStepsM: round(totalSteps / 1_000_000, 2),
    ecgCount: 9,
    mindfulMin: Math.round(mindfulMin),
    daysTracked: stepsDaily.length,
    firstDay: stepsDaily[0]?.d,
  },
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log("lines:", n);
console.log("nights:", nightStats.length, "lastNight:", lastNight?.date, lastNight?.asleepLabel ?? lastNight?.asleep);
console.log("hrv days:", hrvDaily.length, "latest:", out.latest.hrv, "baseline:", hrvBaseline);
console.log("restingHr latest:", out.latest.restingHr, "steps latest:", out.latest.steps, "vo2:", out.latest.vo2max);
console.log("recovery:", recoveryScore, "workouts:", workouts.length);
console.log("wrote", OUT.pathname);
