import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ProviderRequest,
  ProviderResponse,
  ProviderRuntimeClient,
} from './provider-runtime-client';

@Injectable()
export class MockProviderRuntimeClient implements ProviderRuntimeClient {
  run(request: ProviderRequest): Promise<ProviderResponse> {
    const lastMessage = request.messages[request.messages.length - 1];
    if (!lastMessage) {
      return Promise.resolve({
        assistantMessage: 'No input received',
        toolCalls: [],
      });
    }

    if (lastMessage.content.includes('PROVIDER_FAIL')) {
      throw new Error('provider_failure: simulated provider failure');
    }

    if (lastMessage.role === 'tool') {
      return Promise.resolve({
        assistantMessage: `Tool ${lastMessage.toolName ?? 'unknown'} executed: ${lastMessage.content}`,
        toolCalls: [],
      });
    }

    if (lastMessage.role === 'user') {
      const maybeTool = this.parseToolDirective(lastMessage.content);
      if (maybeTool) {
        return Promise.resolve({
          assistantMessage: `Executing tool ${maybeTool.name}`,
          toolCalls: [maybeTool],
        });
      }
    }

    return Promise.resolve({
      assistantMessage: `Handled prompt without tool call: ${lastMessage.content}`,
      toolCalls: [],
    });
  }

  private parseToolDirective(content: string) {
    const match = content.match(/@tool\s+([A-Za-z0-9]+)\s+([\s\S]+)/);
    if (!match) {
      return null;
    }

    const [, toolName, rawPayload] = match;
    let input: Record<string, unknown>;
    try {
      input = JSON.parse(rawPayload) as Record<string, unknown>;
    } catch {
      throw new Error(`Invalid @tool payload JSON: ${rawPayload}`);
    }

    return {
      id: randomUUID(),
      name: toolName,
      input,
    };
  }
}
