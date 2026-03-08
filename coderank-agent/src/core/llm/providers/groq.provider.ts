import Groq from 'groq-sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ILLMProvider, LLMResponse, ILLMConfig } from '../llm.interface';
import { ITool } from '../../tools/tool.interface';
import { config } from '../../../config';

export class GroqProvider implements ILLMProvider {
  private client: Groq;
  private modelName: string;
  private tools: Groq.Chat.Completions.ChatCompletionTool[] = [];
  private history: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];
  // Maps tool name -> tool_call_id so tool results can reference the right call
  private lastToolCallIds: Map<string, string> = new Map();

  constructor(modelName?: string, providerConfig?: ILLMConfig) {
    const apiKey = providerConfig?.apiKey || config.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured and not provided');
    }
    this.client = new Groq({ apiKey });
    this.modelName = modelName || config.DEFAULT_GROQ_MODEL;
  }

  init(systemPrompt: string, tools: ITool[]): void {
    this.tools = this.formatToolsForGroq(tools);
    this.history = [];
    this.lastToolCallIds = new Map();

    if (systemPrompt) {
      this.history.push({ role: 'system', content: systemPrompt });
    }
  }

  async sendMessage(message: any): Promise<LLMResponse> {
    if (typeof message === 'string') {
      this.history.push({ role: 'user', content: message });
    } else if (Array.isArray(message)) {
      // Handle tool responses in the agent's functionResponse format
      message.forEach(msg => {
        if (msg.functionResponse) {
          const { name, response } = msg.functionResponse;
          const toolCallId = this.lastToolCallIds.get(name) || name;
          this.history.push({
            role: 'tool',
            tool_call_id: toolCallId,
            content: JSON.stringify(response),
          });
        } else {
          this.history.push({ role: 'user', content: JSON.stringify(msg) });
        }
      });
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: this.history,
        tools: this.tools.length > 0 ? this.tools : undefined,
      });

      const assistantMessage = response.choices[0].message;
      this.history.push(assistantMessage as Groq.Chat.Completions.ChatCompletionMessageParam);

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        this.lastToolCallIds = new Map();
        assistantMessage.tool_calls.forEach(tc => {
          this.lastToolCallIds.set(tc.function.name, tc.id);
        });

        return {
          toolCalls: assistantMessage.tool_calls.map(tc => ({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments || '{}'),
          })),
        };
      }

      return {
        text: assistantMessage.content || '',
      };
    } catch (error) {
      console.error('[Groq Error]', error);
      throw error;
    }
  }

  private formatToolsForGroq(tools: ITool[]): Groq.Chat.Completions.ChatCompletionTool[] {
    return tools.map(t => {
      const jsonSchema = zodToJsonSchema(t.parameters as any);
      let properties = {};
      let required: string[] = [];
      if ((jsonSchema as any).type === 'object') {
        properties = (jsonSchema as any).properties || {};
        required = (jsonSchema as any).required || [];
      }
      return {
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: {
            type: 'object',
            properties,
            required,
          },
        },
      };
    });
  }
}
