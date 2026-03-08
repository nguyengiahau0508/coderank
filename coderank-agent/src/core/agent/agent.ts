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
    this.llm.init(true ? '' : SYSTEM_PROMPT, this.toolRegistry.getAll());
  }

  private registerDefaultTools() {
    this.toolRegistry.register(GetMyProblemsTool);
    // Add more tools here in the future
  }

  async processQuery(userToken: string, userMessage: string): Promise<string> {
    const apiClient = createInternalClient(userToken);
    let currentMessage: any = userMessage;
    const MAX_ITERATIONS = 5;

    // Log the initial user query
    console.log(`\n==================================================`);
    console.log(`[Agent:Start] User query: "${userMessage}"`);

    try {
      for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`[Agent:Iteration ${i+1}] Processing with LLM...`);
        // Send message to LLM
        const response = await this.llm.sendMessage(currentMessage);

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
                const apiResult = await tool.execute(call.arguments, apiClient);
                console.log(`[Agent:ToolResult] <- Tool: ${tool.name} returned successfully.`);
                // console.log(`[Agent:ToolResult] Raw Data:`, JSON.stringify(apiResult).substring(0, 200) + '...');
                
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

          // Output the result of tools as the next message to the LLM
          currentMessage = toolResponses;
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
}
