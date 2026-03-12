import { ILLMProvider, ILLMConfig } from '../llm/llm.interface';
import { LLMFactory } from '../llm/llm.factory';
import { ToolRegistry, registerAllTools } from '../tools';
import { createInternalClient } from '../../api/api-client';
import { STUDENT_SYSTEM_PROMPT,LECTURER_SYSTEM_PROMPT,ADMIN_SYSTEM_PROMPT, SYSTEM_PROMPT } from '../../prompts/system.prompt';
import { RolesEnum } from '../../common/enums/enums';

export class Agent {
  private llm: ILLMProvider;
  private toolRegistry: ToolRegistry;

  constructor(role: RolesEnum, providerName?: string, modelName?: string, providerConfig?: ILLMConfig) {
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
    this.llm.init(systemPrompt, this.toolRegistry.getAll());
  }

  private registerDefaultTools() {
    registerAllTools(this.toolRegistry);
  }

  async processQuery(userToken: string, userMessage: string): Promise<string> {
    const apiClient = createInternalClient(userToken);
    let currentMessage: any = userMessage;
    const MAX_ITERATIONS = 10;

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

  async processQueryStream(
    userToken: string,
    userMessage: string,
    onEvent: (event: { type: string; content?: string }) => void,
  ): Promise<string> {
    const apiClient = createInternalClient(userToken);
    let currentMessage: any = userMessage;
    const MAX_ITERATIONS = 10;

    onEvent({ type: 'status', content: 'Thinking...' });

    try {
      for (let i = 0; i < MAX_ITERATIONS; i++) {
        const response = await this.llm.sendMessage(currentMessage);

        if (response.toolCalls && response.toolCalls.length > 0) {
          const toolResponses: any[] = [];

          for (const call of response.toolCalls) {
            onEvent({ type: 'status', content: `Analyzing with ${call.name}...` });

            const tool = this.toolRegistry.get(call.name);
            if (tool) {
              try {
                const apiResult = await tool.execute(call.arguments, apiClient);
                toolResponses.push({
                  functionResponse: { name: tool.name, response: apiResult },
                });
              } catch (error: any) {
                toolResponses.push({
                  functionResponse: { name: tool.name, response: { error: error.message } },
                });
              }
            } else {
              toolResponses.push({
                functionResponse: { name: call.name, response: { error: `Tool ${call.name} not found` } },
              });
            }
          }

          currentMessage = toolResponses;
          onEvent({ type: 'status', content: 'Processing results...' });
        } else if (response.text) {
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
