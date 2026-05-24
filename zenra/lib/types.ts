import type { AgentId } from "./agents";

export type ActionKind =
  | "calendar_move"        // move/reschedule an event
  | "calendar_create"      // create a hold/block
  | "calendar_delete"      // delete a hold
  | "slack_dnd"            // set Slack DND / hold pings
  | "slack_status"         // set Slack status
  | "slack_message"        // send a Slack message
  | "nutrition"            // adjust a meal
  | "movement"             // swap a workout
  | "sleep"                // wind-down
  | "reflection"           // prompt a check-in
  | "note";                // informational, no side-effect

export type Bucket = "now" | "morning" | "later";
export type ActionStatus = "pending" | "accepted" | "dismissed" | "snoozed";

export interface Signal {
  text: string;
  color?: string;
}

export interface Proposal {
  id: string;
  agent: AgentId;
  kind: ActionKind;
  bucket: Bucket;
  urgent?: boolean;
  time: string;            // human relative time, e.g. "2 min ago"
  title: string;
  why: string;             // longer explanation, warm tone
  signals: Signal[];
  approveLabel: string;
  status: ActionStatus;
  /** payload for executing the real action */
  payload?: Record<string, unknown>;
  /** filled after execution */
  result?: string;
  externalId?: string;     // e.g. created calendar event id
}

export interface ReasoningStep {
  agent: AgentId;
  time: string;
  line: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  agent?: AgentId;
}
