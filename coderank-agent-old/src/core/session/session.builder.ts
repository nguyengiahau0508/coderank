import {
  Session,
  ConversationMessage,
  ContentBlock,
  MessageRole,
  SESSION_VERSION,
} from './session.interface';
import { TokenUsage } from '../usage';

/**
 * Helper class for building and manipulating sessions.
 * Provides static factory methods for creating messages and sessions.
 */
export class SessionBuilder {
  /**
   * Create a new empty session with a unique ID.
   */
  static createSession(metadata?: Session['metadata']): Session {
    const now = new Date().toISOString();
    return {
      version: SESSION_VERSION,
      id: this.generateId(),
      messages: [],
      createdAt: now,
      updatedAt: now,
      metadata,
    };
  }

  /**
   * Create a user text message.
   */
  static userMessage(text: string): ConversationMessage {
    return {
      role: 'user',
      blocks: [{ type: 'text', text }],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an assistant text message.
   */
  static assistantMessage(text: string, usage?: TokenUsage): ConversationMessage {
    return {
      role: 'assistant',
      blocks: [{ type: 'text', text }],
      usage,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an assistant message with tool calls.
   */
  static assistantToolCalls(
    toolCalls: Array<{ id: string; name: string; input: unknown }>,
    usage?: TokenUsage
  ): ConversationMessage {
    return {
      role: 'assistant',
      blocks: toolCalls.map(tc => ({
        type: 'tool_use' as const,
        id: tc.id,
        name: tc.name,
        input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
      })),
      usage,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a tool result message.
   */
  static toolResult(
    toolUseId: string,
    toolName: string,
    output: unknown,
    isError: boolean = false
  ): ConversationMessage {
    return {
      role: 'tool',
      blocks: [{
        type: 'tool_result',
        toolUseId,
        toolName,
        output: typeof output === 'string' ? output : JSON.stringify(output),
        isError,
      }],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a system message.
   */
  static systemMessage(text: string): ConversationMessage {
    return {
      role: 'system',
      blocks: [{ type: 'text', text }],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Add a message to a session and update timestamp.
   */
  static addMessage(session: Session, message: ConversationMessage): Session {
    return {
      ...session,
      messages: [...session.messages, message],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate a unique session ID.
   */
  private static generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `session_${timestamp}_${randomPart}`;
  }

  /**
   * Extract text content from a message.
   */
  static extractText(message: ConversationMessage): string {
    return message.blocks
      .filter((block): block is Extract<ContentBlock, { type: 'text' }> => block.type === 'text')
      .map(block => block.text)
      .join('\n');
  }

  /**
   * Extract tool uses from a message.
   */
  static extractToolUses(message: ConversationMessage): Array<{ id: string; name: string; input: string }> {
    return message.blocks
      .filter((block): block is Extract<ContentBlock, { type: 'tool_use' }> => block.type === 'tool_use')
      .map(block => ({ id: block.id, name: block.name, input: block.input }));
  }

  /**
   * Calculate total usage for a session.
   */
  static calculateTotalUsage(session: Session): TokenUsage {
    const total: TokenUsage = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };

    for (const message of session.messages) {
      if (message.usage) {
        total.inputTokens += message.usage.inputTokens;
        total.outputTokens += message.usage.outputTokens;
        total.totalTokens += message.usage.totalTokens;
      }
    }

    return total;
  }
}
