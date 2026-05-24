# Zenra

### The invisible team of AI agents that protects your energy — so you can actually show up for work, family, and life instead of burning out.

Zenra isn't another dashboard that hands you ten more charts to feel guilty about. It's a small, named team of AI agents that quietly watches your body's signals, reasons together every morning, and takes real actions across your **calendar** and **Slack** to protect the things that matter: family dinners, focus blocks, workouts, and the meetings that don't deserve your best hours.

> _"Zenra doesn't just remind you. It quietly organizes your life around your energy."_

---

## The team

Seven agents, each with a job, a voice, and a color. They maintain context, coordinate with each other, take real actions, and improve from your feedback.

| Agent | Role | What they protect |
|------|------|-------------------|
| 🟢 **Sage** | Recovery | Your nervous system & battery |
| 🔵 **Lyra** | Sleep | Your wind-down and wake |
| 🟠 **Atlas** | Movement | Training that fits how you feel today |
| 🟣 **Orchid** | Calendar | Your day, choreographed around real capacity |
| 🩵 **Echo** | Focus | A quiet inbox & Slack when your brain needs it |
| 🟩 **Fern** | Nutrition | Meals planned against today's load |
| 💜 **Iris** | Reflection | The one question that turns a day into a lesson |

Above them sits **the Conductor** — the orchestrator that runs the morning "huddle," resolves conflicts between agents, and explains every decision.

---

## What makes it agentic (and not just a chatbot)

- **Full multi-agent workflows, not single actions.** A light night of sleep triggers Lyra → Sage → Orchid → Echo → Atlas → Fern in a coordinated chain. You watch it happen on the **Conductor** screen.
- **Context & memory.** Agents reason over your real vitals (sleep, HRV, recovery, strain) and each other's signals.
- **Real actions across real tools.** Approving a proposal can **create/move/delete Google Calendar events** and **set Slack Do-Not-Disturb** — live.
- **An autonomy spectrum.** Level 1 (Observe) → Level 2 (Co-pilot) → Level 3 (Trusted autopilot, low-risk actions auto-execute) → Level 4 (Full autopilot, with safety gates). Set globally or per-agent.
- **Everything is explainable.** Every proposal has a "Why?", and the Conductor keeps a timestamped reasoning trail.

---

## The screens (10)

| Route | Screen | Highlights |
|-------|--------|-----------|
| `/` | **Home / Chat** | Conversation-first orb, Gemini-powered chat, **ElevenLabs voice**, spoken morning briefing, live vitals rail |
| `/feed` | **Action Feed** | Live proposals grouped by urgency; Approve executes real Calendar/Slack actions; "Run the morning huddle" |
| `/conductor` | **Conductor** ⭐ | The wow screen — agents coordinating live in Timeline / Network / Calendar views + reasoning trail |
| `/recovery` | **Recovery** | Hypnogram, HRV trend, recovery rings, readiness, body signals |
| `/nutrition` | **Nutrition** | Macro rings, the day's plan coordinated with Atlas & Iris, hydration |
| `/reflection` | **Reflection** | Iris's evening check-in — energy, body, one good question |
| `/integrations` | **Integrations** | Live OAuth for Google Calendar, Slack & Strava + the signal layer |
| `/settings` | **Settings** | Profile, autonomy spectrum, per-agent tone & toggles |
| `/onboarding` | **Onboarding** | A warm 6-step setup wizard |
| `/agents/[id]` | **Agent detail** | What each agent watches, did, and learned |

---

## Running it

```bash
cd zenra
npm install
npm run dev      # http://localhost:3000
```

Configuration lives in `.env.local` (already populated for the demo):

| Key | Powers | Status |
|-----|--------|--------|
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Chat, the huddle, morning briefing | ✅ live |
| `ELEVENLABS_API_KEY` | The orb's voice (TTS) | ✅ live (free-tier premade voice) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Calendar OAuth + event create/move/delete | ✅ live¹ |
| `SLACK_BOT_TOKEN` | Echo holding pings / posting | ✅ connects² |
| `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` | Workout history | ✅ live |
| `TOKEN_ENCRYPTION_KEY` | Token vault | ✅ |

¹ Add `http://localhost:3000/api/calendar/callback` to your Google OAuth client's **Authorized redirect URIs** for the live calendar flow.
² Posting messages requires the `chat:write` + `channels:read` scopes on the Slack app; auth/DND works out of the box.

Health metrics are seeded (HealthKit isn't available on the web) and presented as an "import." Everything else — the AI reasoning, the voice, and the calendar/Slack actions — is real.

---

## Architecture

```
zenra/
├── app/
│   ├── page.tsx              # Home (orb + chat + voice + vitals)
│   ├── feed|conductor|recovery|nutrition|reflection|
│   │   integrations|settings|onboarding/page.tsx
│   ├── agents/[id]/page.tsx  # dynamic agent detail (SSG for all 7)
│   └── api/
│       ├── chat            # Gemini, in-character agent replies
│       ├── orchestrate     # the multi-agent "huddle" → fresh proposals
│       ├── briefing        # spoken morning briefing
│       ├── voice           # ElevenLabs TTS
│       ├── proposals[/id]  # list + accept/dismiss/snooze/modify (executes actions)
│       ├── connections     # live integration status
│       ├── calendar/*      # Google OAuth start + callback
│       ├── strava/*        # Strava OAuth
│       └── slack/test      # Slack auth + hello
├── components/   # Shell, Orb, AgentGlyph, Icons, charts
└── lib/
    ├── agents.ts           # the seven personas
    ├── seed.ts             # vitals, proposals, conductor data, the "world"
    ├── gemini.ts           # warm prompts + JSON orchestration
    ├── voice.ts            # ElevenLabs
    ├── execute.ts          # proposal → real Calendar/Slack action
    ├── store.ts            # in-memory state + token vault + OAuth states
    └── integrations/       # calendar.ts, slack.ts, strava.ts
```

Built with **Next.js 16** (App Router, TypeScript, Turbopack), the **Gemini** SDK, **googleapis**, and **@slack/web-api**. Design system ported 1:1 from the original artboards — Instrument Serif display, Geist body, an icy-blue light palette with one warm accent (Atlas).

_Not medical advice. Zenra helps; it does not diagnose._
