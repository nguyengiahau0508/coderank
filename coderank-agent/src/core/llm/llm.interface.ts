import { ITool } from '../tools/tool.interface';

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant' | 'system';
  content: any; // Can be text, or structured data for tool calls/responses
}

export interface ILLMConfig {
  apiKey?: string;
  baseHost?: string;
}

export interface ILLMProvider {
  /**
   * Initializes the chat session with the system prompt and tools.
   */
  init(systemPrompt: string, tools: ITool[]): void;

  /**
   * Sends a message to the LLM and gets the response.
   * If the LLM decides to call a tool, it returns the tool call request.
   */
  sendMessage(message: any): Promise<LLMResponse>;
}

export interface ToolCallRequest {
  id?: string;
  name: string;
  arguments: any;
}

export interface LLMResponse {
  text?: string;
  toolCalls?: ToolCallRequest[];
}
