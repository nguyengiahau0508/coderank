import { ILLMProvider, ILLMConfig } from '../llm/llm.interface';
import { LLMFactory } from '../llm/llm.factory';
import { ToolRegistry } from '../tools/tool.registry';
import { GetMyProblemsTool } from '../tools/definitions/get-my-problems.tool';
import { createInternalClient } from '../../api/api-client';
import { SYSTEM_PROMPT } from '../../prompts/system.prompt';

export class Agent {
  private llm: ILLMProvider;
  private toolRegistry: ToolRegistry;

  constructor(providerName?: string, modelName?: string, providerConfig?: ILLMConfig) {
    // Use factory to get the LLM provider
    this.llm = LLMFactory.createProvider(providerName, modelName, providerConfig);
    
    // Initialize tool registry
    this.toolRegistry = new ToolRegistry();
    this.registerDefaultTools();

    // Initialize the LLM with prompt and tools
    this.llm.init(SYSTEM_PROMPT, this.toolRegistry.getAll());
  }

  private registerDefaultTools() {
    this.toolRegistry.register(GetMyProblemsTool);
    // Add more tools here in the future
  }

  async processQuery(userToken: string, userMessage: string): Promise<string> {
    const apiClient = createInternalClient(userToken);
    let currentMessage: any = userMessage;
    const MAX_ITERATIONS = 5;

    try {
      for (let i = 0; i < MAX_ITERATIONS; i++) {
        // Send message to LLM
        const response = await this.llm.sendMessage(currentMessage);

        // If tools are required, execute them
        if (response.toolCalls && response.toolCalls.length > 0) {
          const toolResponses: any[] = [];

          for (const call of response.toolCalls) {
            const tool = this.toolRegistry.get(call.name);

            if (tool) {
              try {
                console.log(`[Agent] Calling tool: ${tool.name} with args:`, call.arguments);
                const apiResult = await tool.execute(call.arguments, apiClient);
                toolResponses.push({
                  functionResponse: {
                    name: tool.name,
                    response: apiResult
                  }
                });
              } catch (error: any) {
                console.error(`[Agent] Tool error (${tool.name}):`, error.message);
                toolResponses.push({
                  functionResponse: {
                    name: tool.name,
                    response: { error: error.message }
                  }
                });
              }
            } else {
              console.warn(`[Agent] Tool ${call.name} requested by LLM but not registered.`);
              toolResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { error: `Tool ${call.name} not found` }
                }
              });
            }
          }

          // Output the result of tools as the next message to the LLM
          currentMessage = toolResponses;
        } else if (response.text) {
          // If no tools required and we have text, return the final response
          return response.text;
        }
      }
    } catch (error: any) {
      console.error("[Agent Error]:", error);
      return "Tôi gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại!";
    }

    return "Xin lỗi, tôi không thể tìm ra giải pháp sau nhiều bước xử lý.";
  }
}
