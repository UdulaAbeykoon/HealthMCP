import type { AgentId } from "./agents";
import type { Proposal, ReasoningStep } from "./types";

// ── User ────────────────────────────────────────────────────────────
export const USER = {
  name: "Elena",
  fullName: "Elena Marsh",
  email: "elena@marsh.studio",
  initials: "E",
  pronouns: "she / her",
  timezone: "America/New_York",
  memberSince: "Mar 2026",
};

// ── Today's vitals (HealthKit import simulation) ────────────────────
export const VITALS = {
  sleep: {
    asleepLabel: "7h 42m",
    hours: 7, minutes: 42,
    inBed: "11:15 PM", woke: "7:02 AM",
    efficiency: 78,
    bars: [0.65, 0.78, 0.82, 0.74, 0.88, 0.7, 0.6, 0.85, 0.78, 0.92, 0.7, 0.6],
    stages: [
      { k: "Deep", v: "1h 24m", p: 20, color: "var(--accent-2)" },
      { k: "REM", v: "1h 48m", p: 26, color: "var(--ag-iris)" },
      { k: "Light", v: "3h 32m", p: 50, color: "var(--ag-lyra)" },
      { k: "Awake", v: "0h 12m", p: 4, color: "var(--text-mute)" },
    ],
    hypnogram: [2,2,3,3,2,1,2,3,3,2,2,1,2,2,3,2,2,1,1,2,2,3,2,1,1,2,2,2,1,0],
  },
  recovery: { score: 82, label: "Good", note: "Great recovery yesterday" },
  hrv: { value: 62, baseline: 58, unit: "ms", series: [56,58,55,57,60,58,61,59,62,60,63,62] },
  hrv14: [62,60,58,61,55,57,59,55,52,50,56,53,49,48],
  steps: { value: 8246, goalPct: 82 },
  restingHr: 54,
  readiness7: [78, 72, 80, 65, 70, 62, 68],
  recoveryRings: [
    { label: "Autonomic", v: 62, color: "var(--ag-sage)", note: "HRV-driven" },
    { label: "Sleep load", v: 82, color: "var(--ag-lyra)", note: "Last 3 nights" },
    { label: "Strain", v: 71, color: "var(--ag-atlas)", note: "Recovers in 18h" },
  ],
  bodySignals: [
    { k: "Resting HR", v: "54 bpm", t: "+2 vs 30d", chart: [52,51,52,53,55,54,56] },
    { k: "Respiratory rate", v: "14.2 /m", t: "stable", chart: [14,14,14.3,14.1,14.2,14.2,14.2] },
    { k: "SpO₂ avg", v: "97%", t: "normal range", chart: [97,97,98,97,96,97,97] },
    { k: "Skin temperature", v: "−0.2°C", t: "within range", chart: [0.1,0,-0.1,-0.2,-0.3,-0.2,-0.2] },
    { k: "VO₂ max (est.)", v: "47.8", t: "+0.4 in 30d", chart: [46.9,47.0,47.1,47.3,47.5,47.7,47.8] },
  ],
};

// ── Seed proposals — what the team is proposing today ───────────────
// Times are computed relative to "now" when read; static labels here.
export const SEED_PROPOSALS: Proposal[] = [
  {
    id: "p-orchid-resched",
    agent: "orchid", kind: "calendar_move", bucket: "now", urgent: true,
    time: "2 min ago",
    title: "You slept light last night. Want me to push your 9:00 sync to 10:30?",
    why: "You earned a slower start. Your 9am is an internal sync, both attendees are flexible, and a later slot lands you in a higher-energy window — so you actually show up sharp instead of foggy.",
    signals: [
      { text: "Sleep efficiency 78%", color: "var(--ag-lyra)" },
      { text: "HRV −12% vs baseline", color: "var(--ag-sage)" },
      { text: "Internal sync · low stakes" },
    ],
    approveLabel: "Approve & reschedule",
    status: "pending",
    payload: { summary: "Team sync", fromTime: "09:00", toTime: "10:30", durationMin: 30 },
  },
  {
    id: "p-echo-hold",
    agent: "echo", kind: "slack_dnd", bucket: "now", urgent: true,
    time: "8 min ago",
    title: "Slack is loud this morning. I can hold non-urgent pings until 11:30.",
    why: "12 messages, none flagged urgent, and your focus block starts in 4 minutes. I'll set you to Do Not Disturb and surface anything that actually needs you.",
    signals: [
      { text: "12 messages, 0 urgent" },
      { text: "Focus block in 4 min" },
    ],
    approveLabel: "Hold pings",
    status: "pending",
    payload: { until: "11:30", minutes: 120 },
  },
  {
    id: "p-atlas-z2",
    agent: "atlas", kind: "movement", bucket: "morning",
    time: "18 min ago",
    title: "Zone 2 today instead of the planned intervals. Same hour, gentler load.",
    why: "Your last three sessions were genuinely hard and recovery is sitting at 62. A Zone 2 day keeps the streak alive without digging the hole deeper — you'll thank me tomorrow.",
    signals: [
      { text: "Recovery 62 (below 70)", color: "var(--ag-sage)" },
      { text: "Last 3 sessions were hard" },
    ],
    approveLabel: "Swap to Z2",
    status: "pending",
    payload: { from: "Intervals", to: "Zone 2 cardio", durationMin: 45 },
  },
  {
    id: "p-fern-protein",
    agent: "fern", kind: "nutrition", bucket: "morning",
    time: "32 min ago",
    title: "Front-load protein at lunch — you're light on it two days running.",
    why: "You're averaging 78g against a 140g target, and you've got a workout at 16:00. A protein-forward lunch sets up recovery and keeps the afternoon crash away.",
    signals: [
      { text: "Protein 78g / 140g (2-day avg)" },
      { text: "Workout planned 16:00" },
    ],
    approveLabel: "Add to plan",
    status: "pending",
    payload: { meal: "Lunch", targetProtein: 38 },
  },
  {
    id: "p-lyra-winddown",
    agent: "lyra", kind: "sleep", bucket: "later",
    time: "45 min ago",
    title: "Begin wind-down at 21:00 — a little earlier than usual. Small sleep debt.",
    why: "You're carrying about 1h12m of sleep debt. An earlier wind-down — lights down, screens away — gets you to your 22:30 target without it feeling like a fight.",
    signals: [
      { text: "Sleep debt: 1h 12m" },
      { text: "Target bedtime 22:30" },
    ],
    approveLabel: "Set wind-down",
    status: "pending",
    payload: { time: "21:00" },
  },
];

// ── Reasoning trail (the morning huddle) ────────────────────────────
export const REASONING_TRAIL: ReasoningStep[] = [
  { agent: "lyra", time: "06:32", line: "Sleep efficiency 78% · REM down 14m. Flagging recovery." },
  { agent: "sage", time: "06:33", line: "HRV reads 48ms (−12% vs 7-day). Recommending a low-stakes morning." },
  { agent: "orchid", time: "06:34", line: "Scanning the 09:00 sync — internal, both attendees flexible. Proposing 10:30." },
  { agent: "echo", time: "06:35", line: "Aligning the focus block to the new start. Slack hold until 11:30." },
  { agent: "atlas", time: "07:01", line: "Recovery 62 < 70 threshold. Swap intervals → Z2 cardio @ 16:00." },
  { agent: "iris", time: "07:02", line: "Three skipped check-ins. Scheduling a soft prompt for 21:30." },
  { agent: "fern", time: "07:04", line: "Aligning an earlier dinner (Iris flag). Lunch protein bumped to 38g." },
];

// ── Conductor: timeline lanes ───────────────────────────────────────
export interface LaneEvent { s: number; e: number; kind: "signal" | "block" | "watch"; t: string; }
export const CONDUCTOR_LANES: { id: AgentId; events: LaneEvent[] }[] = [
  { id: "orchid", events: [
    { s: 7.2, e: 7.4, kind: "signal", t: "Meeting load: heavy" },
    { s: 8.5, e: 10.5, kind: "block", t: "Sync (moved → 10:30)" },
    { s: 13.5, e: 15, kind: "block", t: "Calls window" },
  ]},
  { id: "lyra", events: [
    { s: 6, e: 7, kind: "signal", t: "Slept light · 78% eff" },
    { s: 21, e: 22, kind: "block", t: "Wind-down" },
  ]},
  { id: "sage", events: [
    { s: 6.5, e: 7, kind: "signal", t: "HRV −12%" },
    { s: 14, e: 15, kind: "watch", t: "Afternoon dip ahead" },
  ]},
  { id: "atlas", events: [
    { s: 7, e: 7.8, kind: "block", t: "Morning walk" },
    { s: 16, e: 17, kind: "block", t: "Z2 cardio · 45m" },
  ]},
  { id: "echo", events: [
    { s: 8, e: 11.5, kind: "block", t: "Focus mode — Slack held" },
    { s: 14, e: 16, kind: "watch", t: "Quiet calls window" },
  ]},
  { id: "fern", events: [
    { s: 12, e: 13, kind: "block", t: "Protein lunch" },
    { s: 18.5, e: 19, kind: "block", t: "Early dinner (Iris flag)" },
  ]},
  { id: "iris", events: [
    { s: 21.5, e: 22, kind: "block", t: "Evening reflection" },
  ]},
];

export const CONDUCTOR_LINKS = [
  { fromA: "lyra", fromT: 6.5, toA: "orchid", toT: 8.5, label: "Reschedule 9am" },
  { fromA: "sage", fromT: 6.7, toA: "atlas", toT: 16, label: "Swap to Z2" },
  { fromA: "echo", fromT: 8.5, toA: "orchid", toT: 13.5, label: "Protect focus" },
  { fromA: "iris", fromT: 21.7, toA: "fern", toT: 18.7, label: "Earlier dinner" },
] as const;

export const CONDUCTOR_NETWORK_SIGNALS = [
  { id: "s1", to: "lyra", label: "Sleep eff 78%", ang: -1.7, r: 310 },
  { id: "s2", to: "sage", label: "HRV −12%", ang: -0.9, r: 300 },
  { id: "s3", to: "orchid", label: "9am · low stakes", ang: -0.3, r: 300 },
  { id: "s4", to: "echo", label: "Slack: 12 msgs", ang: 0.5, r: 310 },
  { id: "s5", to: "fern", label: "Dinner trend", ang: 1.3, r: 300 },
  { id: "s6", to: "atlas", label: "3× hard sessions", ang: 2.2, r: 310 },
  { id: "s7", to: "iris", label: "Missed 3 check-ins", ang: -2.6, r: 300 },
] as const;

export const CONDUCTOR_NETWORK_EDGES = [
  { from: "orchid", to: "lyra", label: "Push 9am", weight: 3 },
  { from: "atlas", to: "sage", label: "Swap to Z2", weight: 3 },
  { from: "echo", to: "orchid", label: "Hold pings", weight: 2 },
  { from: "fern", to: "iris", label: "Earlier dinner", weight: 2 },
  { from: "lyra", to: "orchid", label: "Wind-down 21:00", weight: 1 },
  { from: "iris", to: "lyra", label: "Reflect nudge", weight: 1 },
] as const;

// ── Nutrition ───────────────────────────────────────────────────────
export const NUTRITION = {
  kcal: 1420, kcalTarget: 2100,
  macros: [
    { k: "Protein", v: 86, target: 140, color: "var(--ag-atlas)", p: 61, label: "86 / 140g" },
    { k: "Carbs", v: 152, target: 220, color: "var(--ag-orchid)", p: 69, label: "152 / 220g" },
    { k: "Fat", v: 48, target: 70, color: "var(--ag-fern)", p: 68, label: "48 / 70g" },
  ],
  meals: [
    { time: "07:30", meal: "Greek yogurt + walnuts + berries", sub: "Slow protein, polyphenols. Coffee 30 min later.", kcal: 380, protein: 28, image: "OATS", suggested: false },
    { time: "12:15", meal: "Salmon, lentils, roasted greens", sub: "Bumped to 38g protein — you're 2 days light.", kcal: 540, protein: 38, image: "LUNCH", suggested: true },
    { time: "15:30", meal: "Cottage cheese + honey", sub: "Pre-workout · 60 min before Atlas's session", kcal: 190, protein: 22, image: "SNACK", suggested: false },
    { time: "18:45", meal: "Chicken + sweet potato + miso greens", sub: "Early — Iris flagged late dinners. Done by 19:30.", kcal: 610, protein: 42, image: "DINNER", suggested: true },
  ],
  hydration: { glasses: 4, goal: 8 },
  why: [
    { ag: "atlas" as AgentId, t: "Higher protein → support Z2 cardio recovery" },
    { ag: "sage" as AgentId, t: "Polyphenols + early dinner → HRV rebound" },
    { ag: "iris" as AgentId, t: "Last meal ≤ 7:30pm — fixes 3-day pattern" },
    { ag: "lyra" as AgentId, t: "No caffeine after 13:00 protects 22:30 bedtime" },
  ],
  pantry: ["Salmon", "Lentils", "Kale", "Sweet potato", "Greek yogurt", "Berries", "Cottage cheese", "Miso", "Walnuts"],
};

// ── Reflection ──────────────────────────────────────────────────────
export const REFLECTION = {
  weekMood: [["M", 6], ["T", 7], ["W", 5], ["T", 6], ["F", 8], ["S", 7], ["S", 7]] as [string, number][],
  patterns: [
    { e: "↑", l: "Morning walks correlate with higher mood (4 of last 5)" },
    { e: "↓", l: "Late dinners precede tired mornings (3 of last 4)" },
    { e: "→", l: "“Heavy body” pills cluster on high-strain days" },
    { e: "★", l: "You light up on prompts about your dog. Keeping them." },
  ],
  lastEntry: "\"Long run, sore. Talked to my brother for the first time in a month. Worth being tired for.\"",
  bodyPills: ["Light", "Heavy", "Tense shoulders", "Hungry", "Wired", "Sleepy", "Sore legs", "Headache", "Stomach off", "Restless", "Calm"],
};

// ── Integrations ────────────────────────────────────────────────────
export const INTEGRATIONS = {
  stats: [
    { l: "Events ingested · 24h", v: "1,284" },
    { l: "Inference budget", v: "37% used" },
    { l: "Storage", v: "212 MB" },
    { l: "Latency · p95", v: "412ms" },
  ],
  wearables: [
    { name: "Oura Ring", kind: "Sleep, HRV, temp · primary", status: "connected", lastSync: "3m ago", logo: "O", color: "var(--ag-lyra)", fields: ["Sleep stages","HRV","RHR","Temp","Activity"] },
    { name: "Apple Health", kind: "Aggregated phone signals", status: "connected", lastSync: "just now", logo: "", color: "var(--ag-sage)", fields: ["Steps","Mindful min","ECG","Cycle"] },
    { name: "Whoop 5.0", kind: "Strain · alternative", status: "available", logo: "W", color: "var(--ag-atlas)", fields: ["Strain","Recovery","Sleep"] },
    { name: "Withings", kind: "Body composition", status: "connected", lastSync: "2h ago", logo: "W", color: "var(--ag-fern)", fields: ["Weight","Fat %","BP"] },
  ],
  permissions: [
    { t: "Local-first", d: "Raw signals stay on-device when possible. Only summaries hit the cloud." },
    { t: "Per-agent scope", d: "Each agent reads only what its role requires. Audit log in Settings." },
    { t: "One-tap revoke", d: "Disconnect any source and we forget within 24 hours." },
  ],
};

// ── Agent detail (Orchid example) stats ─────────────────────────────
export const AGENT_DETAIL = {
  watching: [
    { l: "Calendar density (next 72h)", v: "Heavy · 14 meetings" },
    { l: "Recurring drift", v: "Wed standup +9 min" },
    { l: "Energy curve fit", v: "Mismatched 2 days" },
    { l: "Quiet block respect", v: "Held · 0 invasions" },
    { l: "Slack signals from Echo", v: "12 messages held" },
  ],
  recent: [
    { t: "9 min ago", a: "Proposed", l: "Push 9am sync to 10:30 — sleep light", state: "pending" },
    { t: "Today 06:34", a: "Moved", l: "Q-review held Friday 10am (high-energy slot)", state: "done" },
    { t: "Yesterday", a: "Declined", l: "You kept Tuesday's 7pm dinner meeting", state: "skipped" },
    { t: "Yesterday", a: "Auto-moved", l: "Internal sync 14:00 → 15:30 (focus block protected)", state: "auto" },
    { t: "Fri", a: "Coordinated", l: "Hold 30m solo block · with Echo", state: "done" },
    { t: "Thu", a: "Held", l: "Declined 'optional' company all-hands", state: "done" },
  ],
  rules: [
    "Never move 1:1s with my manager",
    "Protect 08:00–11:30 for deep work",
    "No meetings during workout window",
    "Last meeting ends by 17:30 Tue/Thu",
    "Friday afternoons stay open",
  ],
  coordinates: [
    { id: "lyra" as AgentId, l: "Push start times when sleep is short" },
    { id: "echo" as AgentId, l: "Protect focus blocks · hold Slack pings" },
    { id: "atlas" as AgentId, l: "Block windows for training" },
    { id: "fern" as AgentId, l: "Hold mealtime windows · earlier dinners" },
  ],
  confidence: [0.62,0.66,0.7,0.74,0.78,0.82,0.85,0.88,0.91,0.92,0.93,0.94],
};
