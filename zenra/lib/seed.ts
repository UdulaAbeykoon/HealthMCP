import type { AgentId } from "./agents";
import type { Proposal, ReasoningStep } from "./types";
import { buildVitals, LIFETIME } from "./health";

// ── User ── from the real Apple Health export ───────────────────────
export const USER = {
  name: "Udula",
  fullName: "Udula Abeykoon",
  email: "udulaabeykoon@gmail.com",
  initials: "U",
  pronouns: "he / him",
  timezone: "America/New_York",
  memberSince: LIFETIME.firstDay?.slice(0, 7) ?? "Aug 2022",
};

// ── Today's vitals — derived from the real Apple Health export ──────
export const VITALS = buildVitals();

// ── Seed proposals — what the team is proposing today ───────────────
// Times are computed relative to "now" when read; static labels here.
export const SEED_PROPOSALS: Proposal[] = [
  {
    id: "p-orchid-lunch",
    agent: "orchid", kind: "calendar_create", bucket: "now", urgent: true,
    time: "2 min ago",
    title: "You're well-recovered but your calendar's packed 11–4. Want me to guard a real lunch at 12:30?",
    why: "Recovery is sitting at 98 — you've got the energy today, so let's spend it on the right things. There's no break scheduled between your 11am and 4pm, so I'll hold 45 minutes at 12:30 before it fills in.",
    signals: [
      { text: "Recovery 98 · strong", color: "var(--ag-sage)" },
      { text: "No break 11:00–16:00", color: "var(--ag-orchid)" },
      { text: "Calendar low-stakes after lunch" },
    ],
    approveLabel: "Block 12:30 lunch",
    status: "pending",
    payload: { summary: "Lunch — actually step away", time: "12:30", durationMin: 45 },
  },
  {
    id: "p-echo-hold",
    agent: "echo", kind: "slack_dnd", bucket: "now", urgent: true,
    time: "8 min ago",
    title: "Slack's already buzzing. Want me to hold non-urgent pings during your 9–11 deep-work block?",
    why: "14 messages queued, none flagged urgent, and your focus block starts in a few minutes. I'll set Do Not Disturb and surface anything that actually needs you.",
    signals: [
      { text: "14 messages, 0 urgent" },
      { text: "Deep-work block 09:00–11:00" },
    ],
    approveLabel: "Hold pings",
    status: "pending",
    payload: { until: "11:00", minutes: 120 },
  },
  {
    id: "p-atlas-intervals",
    agent: "atlas", kind: "movement", bucket: "morning",
    time: "18 min ago",
    title: "Recovery's at 98 and HRV is right on baseline — today's a green light for the harder session.",
    why: "You've had a few easy days and you're fully recovered. This is the day to spend that fitness — intervals at 16:00. I'll let Fern know so you're fuelled for it.",
    signals: [
      { text: "Recovery 98 · HRV 73 = baseline", color: "var(--ag-sage)" },
      { text: "3 easy days banked" },
    ],
    approveLabel: "Plan intervals @ 16:00",
    status: "pending",
    payload: { from: "Zone 2", to: "Intervals", durationMin: 45 },
  },
  {
    id: "p-fern-protein",
    agent: "fern", kind: "nutrition", bucket: "morning",
    time: "32 min ago",
    title: "Hard session later — let's front-load protein at lunch so you actually recover from it.",
    why: "Atlas has you down for intervals at 16:00. A protein-forward lunch sets up recovery and keeps the afternoon energy steady so you're not running on fumes by dinner.",
    signals: [
      { text: "Workout 16:00 · intervals" },
      { text: "Protein target 140g" },
    ],
    approveLabel: "Add to plan",
    status: "pending",
    payload: { meal: "Lunch", targetProtein: 40 },
  },
  {
    id: "p-lyra-streak",
    agent: "lyra", kind: "sleep", bucket: "later",
    time: "45 min ago",
    title: "You're on a 96%-efficiency streak. Hold the 22:30 wind-down so tomorrow lands as well as today.",
    why: "Last night was 6h55m at 96% efficiency — that's why today feels good. Let's protect the pattern: lights down and screens away from 21:45 so your 22:30 bedtime stays easy.",
    signals: [
      { text: "Sleep efficiency 96%", color: "var(--ag-lyra)" },
      { text: "Target bedtime 22:30" },
    ],
    approveLabel: "Keep wind-down",
    status: "pending",
    payload: { time: "21:45" },
  },
];

// ── Reasoning trail (the morning huddle) ────────────────────────────
export const REASONING_TRAIL: ReasoningStep[] = [
  { agent: "lyra", time: "06:32", line: "Slept 6h55m at 96% efficiency. You're genuinely rested — strong base for today." },
  { agent: "sage", time: "06:33", line: "HRV 73ms, right on your baseline. Recovery 98. This is a green-light day." },
  { agent: "atlas", time: "07:01", line: "Recovery 98 > 80 threshold, three easy days banked. Clearing you for intervals @ 16:00." },
  { agent: "echo", time: "06:35", line: "14 Slack messages queued, none urgent. Holding them during your 9–11 deep-work block." },
  { agent: "orchid", time: "06:34", line: "Calendar's packed 11:00–16:00 with no break. Proposing a 12:30 lunch hold before it fills." },
  { agent: "fern", time: "07:04", line: "Hard session later — front-loading protein at lunch to set up recovery." },
  { agent: "iris", time: "07:02", line: "You're on a good streak. Scheduling a light reflection for 21:30 to capture what's working." },
];

// ── Conductor: timeline lanes ───────────────────────────────────────
export interface LaneEvent { s: number; e: number; kind: "signal" | "block" | "watch"; t: string; }
export const CONDUCTOR_LANES: { id: AgentId; events: LaneEvent[] }[] = [
  { id: "orchid", events: [
    { s: 7.2, e: 7.4, kind: "signal", t: "Meeting load: heavy" },
    { s: 8.5, e: 10.5, kind: "block", t: "Lunch held · 12:30" },
    { s: 13.5, e: 15, kind: "block", t: "Calls window" },
  ]},
  { id: "lyra", events: [
    { s: 6, e: 7, kind: "signal", t: "Slept well · 96% eff" },
    { s: 21, e: 22, kind: "block", t: "Wind-down" },
  ]},
  { id: "sage", events: [
    { s: 6.5, e: 7, kind: "signal", t: "HRV on baseline" },
    { s: 14, e: 15, kind: "watch", t: "Green-light day" },
  ]},
  { id: "atlas", events: [
    { s: 7, e: 7.8, kind: "block", t: "Morning walk" },
    { s: 16, e: 17, kind: "block", t: "Intervals · 45m" },
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
  { fromA: "sage", fromT: 6.7, toA: "orchid", toT: 12, label: "Guard lunch" },
  { fromA: "sage", fromT: 6.7, toA: "atlas", toT: 16, label: "Green-light intervals" },
  { fromA: "echo", fromT: 8.5, toA: "orchid", toT: 13.5, label: "Protect focus" },
  { fromA: "iris", fromT: 21.7, toA: "fern", toT: 18.7, label: "Earlier dinner" },
] as const;

export const CONDUCTOR_NETWORK_SIGNALS = [
  { id: "s1", to: "lyra", label: "Slept 96% eff", ang: -1.7, r: 310 },
  { id: "s2", to: "sage", label: "HRV on baseline", ang: -0.9, r: 300 },
  { id: "s3", to: "orchid", label: "Calendar packed", ang: -0.3, r: 300 },
  { id: "s4", to: "echo", label: "Slack: 12 msgs", ang: 0.5, r: 310 },
  { id: "s5", to: "fern", label: "Dinner trend", ang: 1.3, r: 300 },
  { id: "s6", to: "atlas", label: "3 easy days", ang: 2.2, r: 310 },
  { id: "s7", to: "iris", label: "Missed 3 check-ins", ang: -2.6, r: 300 },
] as const;

export const CONDUCTOR_NETWORK_EDGES = [
  { from: "orchid", to: "sage", label: "Guard lunch", weight: 3 },
  { from: "atlas", to: "sage", label: "Plan intervals", weight: 3 },
  { from: "echo", to: "orchid", label: "Hold pings", weight: 2 },
  { from: "fern", to: "iris", label: "Earlier dinner", weight: 2 },
  { from: "lyra", to: "orchid", label: "Keep wind-down", weight: 1 },
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
