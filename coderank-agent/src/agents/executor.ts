import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { tools } from '../tools/definitions';
import { createInternalClient } from '../services/api-client';
import { SYSTEM_PROMPT } from './prompt';

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export async function processUserQuery(userToken: string, userMessage: string) {
  const apiClient = createInternalClient(userToken);

  // 1. Chuyển đổi công cụ sang định dạng Gemini
  const geminiTools = {
    functionDeclarations: tools.map(t => {
      // Gemini yêu cầu schema chặt chẽ, ta lấy phần 'properties' từ zodToJsonSchema
      const jsonSchema = zodToJsonSchema(t.parameters as any);
      let properties = {};
      let required = [];
      // Ép kiểu để truy xuất đúng
      if ((jsonSchema as any).type === 'object') {
        properties = (jsonSchema as any).properties || {};
        required = (jsonSchema as any).required || [];
      }
      return {
        name: t.name,
        description: t.description,
        parameters: {
          type: "OBJECT",
          properties,
          required,
        },
      };
    }),
  };

  // 2. Khởi tạo Model với System Instruction
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Hoặc gemini-1.5-pro
    systemInstruction: SYSTEM_PROMPT,
    tools: [geminiTools as any],
  });

  // 3. Khởi tạo lịch sử chat
  let chatSession = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 2000,
    },
  });

  let currentMessage = userMessage;
  const MAX_ITERATIONS = 5;

  try {
    // Gửi tin nhắn đầu tiên
    let result = await chatSession.sendMessage(currentMessage);

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = result.response;
      const parts = response.candidates?.[0].content.parts;
      const toolCalls = parts?.filter(p => p.functionCall);

      // Nếu không có yêu cầu gọi tool, trả về text cuối cùng
      if (!toolCalls || toolCalls.length === 0) {
        return response.text();
      }

      // Xử lý các yêu cầu gọi Tool
      const toolResponses: any[] = [];

      for (const call of toolCalls) {
        const functionCall = call.functionCall!;
        const tool = tools.find(t => t.name === functionCall.name);

        if (tool) {
          try {
            console.log(`[Agent] Calling tool: ${tool.name} with args:`, functionCall.args);
            const apiResult = await tool.execute(functionCall.args, apiClient);
            toolResponses.push({
              functionResponse: {
                name: tool.name,
                response: { content: apiResult }
              }
            });
          } catch (error: any) {
            toolResponses.push({
              functionResponse: {
                name: tool.name,
                response: { error: error.message }
              }
            });
          }
        }
      }

      // Gửi kết quả tool ngược lại cho Gemini để nó suy nghĩ tiếp
      result = await chatSession.sendMessage(toolResponses);
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "Tôi gặp sự cố khi kết nối với bộ não AI. Vui lòng thử lại!";
  }

  return "Xin lỗi, tôi không thể tìm ra giải pháp sau nhiều bước xử lý.";
}
