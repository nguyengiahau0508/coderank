import { Ollama, Message, Tool } from 'ollama';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ILLMProvider, LLMResponse, ChatMessage, ILLMConfig } from '../llm.interface';
import { ITool } from '../../tools/tool.interface';
import { config } from '../../../config';

export class OllamaProvider implements ILLMProvider {
  private client: Ollama;
  private modelName: string;
  private systemPrompt?: string;
  private tools: Tool[] = [];
  private history: Message[] = [];

  constructor(modelName?: string, providerConfig?: ILLMConfig) {
    const host = providerConfig?.baseHost || config.OLLAMA_HOST;
    this.client = new Ollama({ host });
    this.modelName = modelName || config.DEFAULT_OLLAMA_MODEL;
  }

  init(systemPrompt: string, tools: ITool[]): void {
    this.systemPrompt = systemPrompt;
    this.tools = this.formatToolsForOllama(tools);
    this.history = [];
    
    // Add system message to history
    this.history.push({
      role: 'system',
      content: this.systemPrompt,
    });
  }

  async sendMessage(message: any): Promise<LLMResponse> {
    // Determine the role and content to append to history
    if (typeof message === 'string') {
      this.history.push({ role: 'user', content: message });
    } else if (Array.isArray(message)) {
      // Handle tool responses that were passed back to LLM
      message.forEach(msg => {
        if (msg.functionResponse) {
           this.history.push({
             role: 'tool',
             content: JSON.stringify(msg.functionResponse.response),
             name: msg.functionResponse.name
           } as Message);
        } else {
           this.history.push({ role: 'user', content: JSON.stringify(msg) });
        }
      });
    }

    try {
      const response = await this.client.chat({
        model: this.modelName,
        messages: this.history,
        tools: this.tools.length > 0 ? this.tools : undefined,
      });

      this.history.push(response.message);

      if (response.message.tool_calls && response.message.tool_calls.length > 0) {
        return {
          toolCalls: response.message.tool_calls.map(call => ({
            name: call.function.name,
            arguments: call.function.arguments,
          }))
        };
      }

      return {
        text: response.message.content,
      };
    } catch (error) {
      console.error(`[Ollama Error]`, error);
      throw error;
    }
  }

  private formatToolsForOllama(tools: ITool[]): Tool[] {
    return tools.map(t => {
      const jsonSchema = zodToJsonSchema(t.parameters as any);
      let properties = {};
      let required = [];
      if ((jsonSchema as any).type === 'object') {
        properties = (jsonSchema as any).properties || {};
        required = (jsonSchema as any).required || [];
      }
      return {
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: {
            type: 'object',
            properties,
            required,
          },
        }
      };
    });
  }
}
