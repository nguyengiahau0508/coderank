import {
  AgentStatus,
  SubagentType,
  TaskStatus,
  WorkerFailureKind,
  WorkerEventKind,
  WorkerStatus,
} from './status.enums';

export interface TaskMessage {
  id: string;
  role: 'system' | 'assistant' | 'tool';
  content: string;
  createdAt: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  input?: unknown;
  status: TaskStatus;
  messages: TaskMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkerEvent {
  kind: WorkerEventKind;
  createdAt: string;
  details?: Record<string, unknown>;
}

export interface WorkerRecord {
  id: string;
  name: string;
  status: WorkerStatus;
  trustResolved: boolean;
  toolPermissionGranted: boolean;
  startupTimeoutAt: string;
  lastObservation?: string;
  currentPrompt?: string;
  queuedReplayPrompt?: string;
  failureKind?: WorkerFailureKind;
  completionSummary?: string;
  events: WorkerEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentRecord {
  id: string;
  subagentType: SubagentType;
  status: AgentStatus;
  prompt: string;
  systemPrompt?: string;
  sessionId?: string;
  sessionContextSnapshot?: string;
  allowedTools: string[];
  finalOutput?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionTurn {
  id: string;
  userMessage: string;
  assistantMessage?: string;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  title?: string;
  contextSummary: string;
  focusPoints: string[];
  keywords: string[];
  turns: SessionTurn[];
  createdAt: string;
  updatedAt: string;
}
