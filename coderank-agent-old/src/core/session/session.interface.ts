import { TokenUsage } from '../usage';

/**
 * Session schema version for migration support.
 * Increment when changing the session format.
 */
export const SESSION_VERSION = 1;

/**
 * Message roles in a conversation.
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * Content block types following AGENT_DESIGN.md block-based content pattern.
 */
export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: string }
  | { type: 'tool_result'; toolUseId: string; toolName: string; output: string; isError: boolean };

/**
 * A single message in the conversation history.
 * Block-based content allows mixed content (text + tool calls).
 */
export interface ConversationMessage {
  role: MessageRole;
  blocks: ContentBlock[];
  usage?: TokenUsage;
  timestamp?: string;
}

/**
 * Turn summary containing results from a single conversation turn.
 */
export interface TurnSummary {
  messages: ConversationMessage[];
  toolResults: Array<{
    toolName: string;
    output: string;
    isError: boolean;
  }>;
  iterations: number;
  usage?: TokenUsage;
}

/**
 * Session state for conversation persistence.
 * Versioned schema supports backward-compatible migrations.
 */
export interface Session {
  version: number;
  id: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: {
    role?: string;
    provider?: string;
    model?: string;
  };
}

/**
 * Session manager interface for persistence operations.
 */
export interface ISessionManager {
  create(metadata?: Session['metadata']): Session;
  save(session: Session): Promise<void>;
  load(sessionId: string): Promise<Session | null>;
  list(): Promise<string[]>;
  delete(sessionId: string): Promise<void>;
}
