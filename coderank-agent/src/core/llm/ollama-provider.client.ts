import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ProviderRequest,
  ProviderResponse,
  ProviderRuntimeClient,
  RuntimeToolCall,
} from './provider-runtime-client';

interface OllamaToolCall {
  function?: {
    name?: string;
    arguments?: unknown;
  };
}

interface OllamaResponsePayload {
  message?: {
    content?: string;
    tool_calls?: OllamaToolCall[];
  };
}

@Injectable()
export class OllamaProviderRuntimeClient implements ProviderRuntimeClient {
  async run(request: ProviderRequest): Promise<ProviderResponse> {
    const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434';
    const model = process.env.OLLAMA_MODEL ?? 'qwen2.5:7b-instruct';
    const endpoint = new URL('/api/chat', baseUrl).toString();

    const payload = {
      model,
      stream: false,
      messages: this.mapMessages(request.systemPrompt, request.messages),
      tools: request.allowedTools.map((toolName) =>
        this.toOllamaToolDefinition(toolName),
      ),
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: request.abortSignal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `provider_failure: ollama /api/chat ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    const data = (await response.json()) as OllamaResponsePayload;
    const assistantMessage = data.message?.content?.trim() ?? '';
    const toolCalls = this.parseToolCalls(data.message?.tool_calls ?? []);

    if (!assistantMessage && toolCalls.length === 0) {
      throw new Error(
        'provider_failure: ollama returned empty assistant message and no tool calls',
      );
    }

    return {
      assistantMessage: assistantMessage || 'Tool call requested',
      toolCalls,
    };
  }

  private mapMessages(
    systemPrompt: string | undefined,
    messages: ProviderRequest['messages'],
  ) {
    const normalized = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    if (!systemPrompt) {
      return normalized;
    }

    return [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...normalized,
    ];
  }

  private toOllamaToolDefinition(toolName: string) {
    return {
      type: 'function',
      function: {
        name: toolName,
        description: `Runtime tool ${toolName}`,
        parameters: {
          type: 'object',
          properties: {},
          additionalProperties: true,
        },
      },
    };
  }

  private parseToolCalls(toolCalls: OllamaToolCall[]): RuntimeToolCall[] {
    return toolCalls.map((toolCall) => {
      const functionName = toolCall.function?.name;
      if (!functionName) {
        throw new Error(
          'provider_failure: ollama returned tool call without function name',
        );
      }

      return {
        id: randomUUID(),
        name: functionName,
        input: this.parseToolInput(toolCall.function?.arguments),
      };
    });
  }

  private parseToolInput(rawArguments: unknown): Record<string, unknown> {
    if (rawArguments == null) {
      return {};
    }

    if (typeof rawArguments === 'string') {
      try {
        const parsed = JSON.parse(rawArguments) as unknown;
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          !Array.isArray(parsed)
        ) {
          return parsed as Record<string, unknown>;
        }
        throw new Error();
      } catch {
        throw new Error(
          `provider_failure: invalid ollama tool arguments JSON: ${rawArguments}`,
        );
      }
    }

    if (typeof rawArguments === 'object' && !Array.isArray(rawArguments)) {
      return rawArguments as Record<string, unknown>;
    }

    throw new Error('provider_failure: invalid ollama tool arguments shape');
  }
}
