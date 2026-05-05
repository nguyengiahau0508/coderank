export interface RuntimeMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  toolName?: string;
}

export interface RuntimeToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ProviderRequest {
  systemPrompt?: string;
  allowedTools: string[];
  messages: RuntimeMessage[];
  abortSignal?: AbortSignal;
}

export interface ProviderResponse {
  assistantMessage: string;
  toolCalls: RuntimeToolCall[];
}

export interface ProviderRuntimeClient {
  run(request: ProviderRequest): Promise<ProviderResponse>;
}

export const PROVIDER_RUNTIME_CLIENT = Symbol('PROVIDER_RUNTIME_CLIENT');
