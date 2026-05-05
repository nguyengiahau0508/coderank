import { Inject, Injectable } from '@nestjs/common';
import {
  PROVIDER_RUNTIME_CLIENT,
  RuntimeMessage,
} from '../llm/provider-runtime-client';
import type { ProviderRuntimeClient } from '../llm/provider-runtime-client';
import { ToolDispatcherService } from '../tools/tool-dispatcher.service';
import { SubagentType } from '../../domain/status.enums';

export interface RuntimeRunInput {
  prompt: string;
  systemPrompt?: string;
  allowedTools: string[];
  subagentType: SubagentType;
  abortSignal?: AbortSignal;
  accessToken?: string;
  maxTurns?: number;
}

export interface RuntimeRunResult {
  finalMessage: string;
  messages: RuntimeMessage[];
}

@Injectable()
export class RuntimeLoopService {
  constructor(
    @Inject(PROVIDER_RUNTIME_CLIENT)
    private readonly provider: ProviderRuntimeClient,
    private readonly tools: ToolDispatcherService,
  ) {}

  async runTurn(input: RuntimeRunInput): Promise<RuntimeRunResult> {
    const maxTurns = input.maxTurns ?? 12;
    const messages: RuntimeMessage[] = [
      {
        role: 'user',
        content: input.prompt,
      },
    ];

    for (let turn = 0; turn < maxTurns; turn += 1) {
      if (input.abortSignal?.aborted) {
        throw new Error('Agent stopped');
      }

      const response = await this.provider.run({
        systemPrompt: input.systemPrompt,
        allowedTools: input.allowedTools,
        messages,
        abortSignal: input.abortSignal,
      });

      messages.push({
        role: 'assistant',
        content: response.assistantMessage,
      });

      if (response.toolCalls.length === 0) {
        return {
          finalMessage: response.assistantMessage,
          messages,
        };
      }

      for (const toolCall of response.toolCalls) {
        const execution = await this.tools.execute(
          toolCall.name,
          toolCall.input,
          {
            role: 'subagent',
            subagentType: input.subagentType,
            allowedTools: input.allowedTools,
            accessToken: input.accessToken,
          },
        );

        messages.push({
          role: 'tool',
          toolCallId: toolCall.id,
          toolName: toolCall.name,
          content: JSON.stringify(execution.output),
        });
      }
    }

    throw new Error(`Runtime loop exceeded ${maxTurns} turns`);
  }
}
