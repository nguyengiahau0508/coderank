import { ILLMProvider, ILLMConfig } from '../llm/llm.interface';
import { LLMFactory } from '../llm/llm.factory';
import { ToolRegistry, registerAllTools } from '../tools';
import { createInternalClient } from '../../api/api-client';
import { STUDENT_SYSTEM_PROMPT,LECTURER_SYSTEM_PROMPT,ADMIN_SYSTEM_PROMPT, SYSTEM_PROMPT } from '../../prompts/system.prompt';
import { RolesEnum } from '../../common/enums/enums';
import { config } from '../../config';
import { ContextWindowManager, ContextWindowPolicy } from '../context-window';

export class Agent {
  private llm: ILLMProvider;
  private toolRegistry: ToolRegistry;
  private contextWindowManager: ContextWindowManager;
  private readonly LLM_RETRY_ATTEMPTS = 2;
  private readonly LLM_RETRY_BASE_DELAY_MS = 700;

  constructor(role: RolesEnum, providerName?: string, modelName?: string, providerConfig?: ILLMConfig) {
    const contextPolicy = this.buildContextPolicy(providerConfig?.contextPolicy);
    this.contextWindowManager = new ContextWindowManager(contextPolicy);

    this.llm = LLMFactory.createProvider(providerName, modelName, providerConfig);
    
    this.toolRegistry = new ToolRegistry();
    this.registerDefaultTools();

    let systemPrompt = SYSTEM_PROMPT;
    switch (role) {
      case RolesEnum.Admin:
        systemPrompt = ADMIN_SYSTEM_PROMPT;
        break;
      case RolesEnum.Instructor:
        systemPrompt = LECTURER_SYSTEM_PROMPT;
        break;
      case RolesEnum.Student:
        systemPrompt = STUDENT_SYSTEM_PROMPT;
        break;
    }
    this.llm.init(systemPrompt, this.toolRegistry.getAll(), providerConfig?.initialHistory);
  }

  private buildContextPolicy(overrides?: Partial<ContextWindowPolicy>): ContextWindowPolicy {
    const basePolicy: ContextWindowPolicy = {
      maxInputTokens: config.CONTEXT_WINDOW_MAX_INPUT_TOKENS,
      outputReserveTokens: config.CONTEXT_WINDOW_OUTPUT_RESERVE_TOKENS,
      historyRetentionRatio: config.CONTEXT_WINDOW_HISTORY_RETENTION_RATIO,
      maxToolResponseChars: config.CONTEXT_WINDOW_TOOL_RESULT_MAX_CHARS,
      maxToolResponsesTotalChars: config.CONTEXT_WINDOW_TOOL_RESULTS_MAX_TOTAL_CHARS,
      summaryMaxChars: config.CONTEXT_WINDOW_SUMMARY_MAX_CHARS,
    };

    return {
      ...basePolicy,
      ...overrides,
    };
  }

  private registerDefaultTools() {
    registerAllTools(this.toolRegistry);
  }

  private async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRetryableLlmError(error: any): boolean {
    const status = error?.status_code ?? error?.status;
    const msg = String(error?.message ?? error?.error ?? '');
    return status === 503 || msg.includes('Service Temporarily Unavailable');
  }

  private async sendMessageWithRetry(
    message: any,
    logPrefix: string,
    onEvent?: (event: { type: string; content?: string }) => void,
  ) {
    for (let attempt = 0; attempt <= this.LLM_RETRY_ATTEMPTS; attempt++) {
      try {
        return await this.llm.sendMessage(message);
      } catch (error: any) {
        const retryable = this.isRetryableLlmError(error);
        const canRetry = retryable && attempt < this.LLM_RETRY_ATTEMPTS;

        if (!canRetry) {
          throw error;
        }

        const delay = this.LLM_RETRY_BASE_DELAY_MS * (attempt + 1);
        console.warn(
          `${logPrefix}:LLMRetry] Service unavailable (attempt ${attempt + 1}/${this.LLM_RETRY_ATTEMPTS + 1}). Retrying in ${delay}ms...`,
        );
        if (onEvent) {
          onEvent({ type: 'status', content: 'LLM tạm thời quá tải, đang thử lại...' });
        }
        await this.wait(delay);
      }
    }

    throw new Error('Unexpected retry flow');
  }

  private extractValidationIssues(error: any): Array<{ code?: string; expected?: string; path?: Array<string | number> }> {
    if (Array.isArray(error?.issues)) {
      return error.issues;
    }

    const message = error?.message;
    if (typeof message !== 'string') {
      return [];
    }

    try {
      const parsed = JSON.parse(message);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private getByPath(source: any, path: Array<string | number>) {
    return path.reduce((acc, key) => (acc == null ? undefined : acc[key]), source);
  }

  private setByPath(target: any, path: Array<string | number>, value: unknown) {
    if (path.length === 0) {
      return;
    }

    let cursor = target;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (cursor[key] == null || typeof cursor[key] !== 'object') {
        return;
      }
      cursor = cursor[key];
    }

    const leafKey = path[path.length - 1];
    cursor[leafKey] = value;
  }

  private coerceByValidationIssues(args: unknown, error: any): unknown {
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      return null;
    }

    const issues = this.extractValidationIssues(error);
    if (issues.length === 0) {
      return null;
    }

    const clonedArgs = JSON.parse(JSON.stringify(args));
    let hasChanges = false;

    for (const issue of issues) {
      if (issue?.code !== 'invalid_type' || !Array.isArray(issue.path) || issue.path.length === 0) {
        continue;
      }

      const currentValue = this.getByPath(clonedArgs, issue.path);
      if (typeof currentValue !== 'string') {
        continue;
      }

      if (issue.expected === 'number') {
        const numeric = Number(currentValue);
        if (!Number.isNaN(numeric)) {
          this.setByPath(clonedArgs, issue.path, numeric);
          hasChanges = true;
        }
      }

      if (issue.expected === 'boolean') {
        const lowered = currentValue.trim().toLowerCase();
        if (lowered === 'true' || lowered === 'false') {
          this.setByPath(clonedArgs, issue.path, lowered === 'true');
          hasChanges = true;
        }
      }
    }

    return hasChanges ? clonedArgs : null;
  }

  private async executeToolWithRecovery(tool: any, rawArgs: unknown, apiClient: any, logPrefix: string) {
    try {
      return await tool.execute(rawArgs, apiClient);
    } catch (error: any) {
      const repairedArgs = this.coerceByValidationIssues(rawArgs, error);
      if (!repairedArgs) {
        throw error;
      }

      console.warn(`${logPrefix}:ToolRecovery] Retrying ${tool.name} with coerced argument types.`);
      return await tool.execute(repairedArgs, apiClient);
    }
  }

  async processQuery(userToken: string, userMessage: string): Promise<string> {
    const apiClient = createInternalClient(userToken);
    let currentMessage: any = userMessage;
    const MAX_ITERATIONS = 20;

    // Log the initial user query
    console.log(`\n==================================================`);
    console.log(`[Agent:Start] User query: "${userMessage}"`);

    try {
      for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`[Agent:Iteration ${i + 1}] Processing with LLM...`);
        // Send message to LLM
        const response = await this.sendMessageWithRetry(currentMessage, '[Agent');

        // Record any intermediate thoughts or partial responses before tools
        if (response.text && response.toolCalls && response.toolCalls.length > 0) {
          console.log(`[Agent:Thought] Partial output before tools:`, response.text);
        }

        // If tools are required, execute them
        if (response.toolCalls && response.toolCalls.length > 0) {
          console.log(`[Agent:Tools] Requested ${response.toolCalls.length} tool(s).`);
          const toolResponses: any[] = [];

          for (const call of response.toolCalls) {
            console.log(`[Agent:ToolCall] -> Tool: ${call.name} | Args:`, JSON.stringify(call.arguments));
            
            const tool = this.toolRegistry.get(call.name);

            if (tool) {
              try {
                const apiResult = await this.executeToolWithRecovery(
                  tool,
                  call.arguments,
                  apiClient,
                  '[Agent',
                );
                console.log(`[Agent:ToolResult] <- Tool: ${tool.name} returned successfully.`);
                toolResponses.push({
                  functionResponse: {
                    name: tool.name,
                    response: apiResult
                  }
                });
              } catch (error: any) {
                console.error(`[Agent:ToolError] ERROR in ${tool.name}:`, error.message);
                toolResponses.push({
                  functionResponse: {
                    name: tool.name,
                    response: { error: error.message }
                  }
                });
              }
            } else {
              console.warn(`[Agent:ToolWarning] LLM requested unregistered tool: ${call.name}`);
              toolResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { error: `Tool ${call.name} not found` }
                }
              });
            }
          }

          const compactionResult = this.contextWindowManager.compactToolResponses(toolResponses);
          if (compactionResult.compactedCount > 0) {
            console.warn(
              `[Agent:Context] Compacted ${compactionResult.compactedCount} tool result(s) (${compactionResult.totalCharsBefore} -> ${compactionResult.totalCharsAfter} chars).`,
            );
          }

          // Output the result of tools as the next message to the LLM
          currentMessage = compactionResult.payload;
        } else if (response.text) {
          // If no tools required and we have text, return the final response
          console.log(`[Agent:Finish] Returning final answer.`);
          console.log(`==================================================\n`);
          return response.text;
        }
      }
    } catch (error: any) {
      console.error("[Agent Error]:", error);
      return "Tôi gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại!";
    }

    return "Xin lỗi, tôi không thể tìm ra giải pháp sau nhiều bước xử lý.";
  }

  async processQueryStream(
    userToken: string,
    userMessage: string,
    onEvent: (event: { type: string; content?: string }) => void,
  ): Promise<string> {
    const apiClient = createInternalClient(userToken);
    let currentMessage: any = userMessage;
    const MAX_ITERATIONS = 10;

    console.log(`\n==================================================`);
    console.log(`[Agent:Stream:Start] User query: "${userMessage}"`);
    onEvent({ type: 'status', content: 'Thinking...' });

    try {
      for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`[Agent:Stream:Iteration ${i + 1}] Processing with LLM...`);
        const response = await this.sendMessageWithRetry(currentMessage, '[Agent:Stream', onEvent);

        if (response.text && response.toolCalls && response.toolCalls.length > 0) {
          console.log(`[Agent:Stream:Thought] Partial output before tools:`, response.text);
        }

        if (response.toolCalls && response.toolCalls.length > 0) {
          console.log(`[Agent:Stream:Tools] Requested ${response.toolCalls.length} tool(s).`);
          const toolResponses: any[] = [];

          for (const call of response.toolCalls) {
            onEvent({ type: 'status', content: `Analyzing with ${call.name}...` });
            console.log(`[Agent:Stream:ToolCall] -> Tool: ${call.name} | Args:`, JSON.stringify(call.arguments));

            const tool = this.toolRegistry.get(call.name);
            if (tool) {
              try {
                const apiResult = await this.executeToolWithRecovery(
                  tool,
                  call.arguments,
                  apiClient,
                  '[Agent:Stream',
                );
                console.log(`[Agent:Stream:ToolResult] <- Tool: ${tool.name} returned successfully.`);
                toolResponses.push({
                  functionResponse: { name: tool.name, response: apiResult },
                });
              } catch (error: any) {
                console.error(`[Agent:Stream:ToolError] ERROR in ${tool.name}:`, error.message);
                toolResponses.push({
                  functionResponse: { name: tool.name, response: { error: error.message } },
                });
              }
            } else {
              console.warn(`[Agent:Stream:ToolWarning] LLM requested unregistered tool: ${call.name}`);
              toolResponses.push({
                functionResponse: { name: call.name, response: { error: `Tool ${call.name} not found` } },
              });
            }
          }

          const compactionResult = this.contextWindowManager.compactToolResponses(toolResponses);
          if (compactionResult.compactedCount > 0) {
            console.warn(
              `[Agent:Stream:Context] Compacted ${compactionResult.compactedCount} tool result(s) (${compactionResult.totalCharsBefore} -> ${compactionResult.totalCharsAfter} chars).`,
            );
            onEvent({ type: 'status', content: 'Optimizing context window...' });
          }

          currentMessage = compactionResult.payload;
          console.log(`[Agent:Stream:Status] Processing tool results...`);
          onEvent({ type: 'status', content: 'Processing results...' });
        } else if (response.text) {
          console.log(`[Agent:Stream:Finish] Returning final answer.`);
          console.log(`==================================================\n`);
          return response.text;
        }
      }
    } catch (error: any) {
      console.error('[Agent Stream Error]:', error);
      return 'Tôi gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại!';
    }

    return 'Xin lỗi, tôi không thể tìm ra giải pháp sau nhiều bước xử lý.';
  }
}
