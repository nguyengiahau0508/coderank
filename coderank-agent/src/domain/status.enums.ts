export enum TaskStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  STOPPED = 'stopped',
}

export enum WorkerStatus {
  TRUST_REQUIRED = 'trust_required',
  TOOL_PERMISSION_REQUIRED = 'tool_permission_required',
  READY_FOR_PROMPT = 'ready_for_prompt',
  PROMPT_IN_FLIGHT = 'prompt_in_flight',
  COMPLETED = 'completed',
  PROVIDER_FAILURE = 'provider_failure',
  STARTUP_TIMEOUT = 'startup_timeout',
}

export enum WorkerFailureKind {
  PROVIDER_FAILURE = 'provider_failure',
  STARTUP_TIMEOUT = 'startup_timeout',
}

export enum WorkerEventKind {
  CREATED = 'created',
  OBSERVED = 'observed',
  TRUST_REQUIRED = 'trust_required',
  TRUST_RESOLVED = 'trust_resolved',
  TOOL_PERMISSION_REQUIRED = 'tool_permission_required',
  TOOL_PERMISSION_GRANTED = 'tool_permission_granted',
  READY_FOR_PROMPT = 'ready_for_prompt',
  PROMPT_SENT = 'prompt_sent',
  PROMPT_MISDELIVERY_DETECTED = 'prompt_misdelivery_detected',
  PROMPT_REPLAY_QUEUED = 'prompt_replay_queued',
  COMPLETED = 'completed',
  PROVIDER_FAILURE = 'provider_failure',
  STARTUP_TIMEOUT = 'startup_timeout',
}

export enum AgentStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  STOPPED = 'stopped',
}

export type SubagentType = 'orchestrator' | 'task-specialist' | 'observer';
