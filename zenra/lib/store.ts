// In-memory server store. Single-user demo; persists for the dev-server lifetime.
// Survives HMR via globalThis caching, and OAuth tokens persist to disk so the
// calendar/Slack/Strava connections survive a dev-server restart.
import fs from "node:fs";
import path from "node:path";
import { SEED_PROPOSALS, REASONING_TRAIL } from "./seed";
import type { Proposal, ReasoningStep } from "./types";
import type { AgentId } from "./agents";

const TOKENS_FILE = path.join(process.cwd(), ".data", "tokens.json");

function loadTokens(): Record<string, Tokens> {
  try { return JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8")); } catch { return {}; }
}
function persistTokens(tokens: Record<string, Tokens>) {
  try {
    fs.mkdirSync(path.dirname(TOKENS_FILE), { recursive: true });
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
  } catch { /* best-effort */ }
}

export interface ActivityEntry {
  id: string;
  agent: AgentId;
  time: string;        // ISO
  verb: string;        // "Moved", "Held", "Proposed", ...
  line: string;
  state: "done" | "auto" | "pending" | "skipped";
}

export interface Connection {
  id: string;
  connected: boolean;
  lastSync?: string;
  account?: string;
  mode?: "live" | "mock";
}

interface OAuthState { state: string; createdAt: number; }

export interface Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;   // epoch ms
  scope?: string;
  account?: string;
}

interface ZenraStore {
  proposals: Proposal[];
  reasoning: ReasoningStep[];
  activity: ActivityEntry[];
  connections: Record<string, Connection>;
  tokens: Record<string, Tokens>;
  oauthStates: OAuthState[];
  autonomyLevel: number;            // 1..4
  agentEnabled: Record<string, boolean>;
}

function seedStore(): ZenraStore {
  const tokens = loadTokens();
  const conn = (id: string): Connection =>
    tokens[id]
      ? { id, connected: true, mode: "live", account: tokens[id].account, lastSync: new Date().toISOString() }
      : { id, connected: false, mode: "mock" };
  return {
    proposals: structuredClone(SEED_PROPOSALS),
    reasoning: structuredClone(REASONING_TRAIL),
    activity: [],
    connections: { calendar: conn("calendar"), slack: conn("slack"), strava: conn("strava") },
    tokens,
    oauthStates: [],
    autonomyLevel: 2,
    agentEnabled: { sage: true, lyra: true, atlas: true, orchid: true, echo: true, fern: true, iris: true },
  };
}

const g = globalThis as unknown as { __zenra?: ZenraStore };
export const store: ZenraStore = g.__zenra ?? (g.__zenra = seedStore());

// ── helpers ─────────────────────────────────────────────────────────
export function resetStore() {
  g.__zenra = seedStore();
}

export function findProposal(id: string) {
  return store.proposals.find((p) => p.id === id);
}

export function logActivity(e: Omit<ActivityEntry, "id" | "time"> & { time?: string }) {
  const entry: ActivityEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: e.time ?? new Date().toISOString(),
    agent: e.agent,
    verb: e.verb,
    line: e.line,
    state: e.state,
  };
  store.activity.unshift(entry);
  return entry;
}

export function setTokens(provider: string, tokens: Tokens) {
  store.tokens[provider] = tokens;
  store.connections[provider] = {
    id: provider,
    connected: true,
    mode: "live",
    lastSync: new Date().toISOString(),
    account: tokens.account,
  };
  persistTokens(store.tokens);
}

export function getTokens(provider: string): Tokens | undefined {
  return store.tokens[provider];
}

/** Write the current in-memory tokens to disk if they aren't there yet (e.g. connected before persistence existed). */
export function ensurePersisted() {
  if (Object.keys(store.tokens).length && !fs.existsSync(TOKENS_FILE)) persistTokens(store.tokens);
}

export function newOAuthState(): string {
  const state = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  store.oauthStates.push({ state, createdAt: Date.now() });
  // prune old (>10 min)
  store.oauthStates = store.oauthStates.filter((s) => Date.now() - s.createdAt < 600_000);
  return state;
}

export function consumeOAuthState(state: string): boolean {
  const idx = store.oauthStates.findIndex((s) => s.state === state);
  if (idx === -1) return false;
  store.oauthStates.splice(idx, 1); // single use — replay rejected
  return true;
}
