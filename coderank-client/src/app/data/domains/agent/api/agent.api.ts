import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, BaseApi } from '../../../shared';
import { API_ENDPOINTS } from '../../../shared/constants/api.constants';
import { AiProviderEnum } from '../../../shared/enums/enums';

export interface ChatMessageDto {
  message: string;
  provider?: AiProviderEnum;
}

export interface ChatResponse {
  message: string;
}

export interface ConversationModel {
  id: string;
  title: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessageModel {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ConversationWithMessages extends ConversationModel {
  messages: ConversationMessageModel[];
}

export interface AiConfigModel {
  id?: string;
  provider: AiProviderEnum;
  modelName?: string;
  apiKey?: string;
  baseHost?: string;
}

export interface UpsertAiConfigDto {
  provider: AiProviderEnum;
  modelName?: string;
  apiKey?: string;
  baseHost?: string;
}

/** Available models per provider */
export const AI_PROVIDER_MODELS: Record<AiProviderEnum, string[]> = {
  [AiProviderEnum.Gemini]: [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
  ],
  [AiProviderEnum.Groq]: [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'gemma2-9b-it',
    'mixtral-8x7b-32768',
    'openai/gpt-oss-120b'
  ],
  [AiProviderEnum.Ollama]: [
    'qwen2.5',
    'llama3.1',
    'codellama',
    'mistral',
    'deepseek-coder',
  ],
};

@Injectable({
  providedIn: 'root',
})
export class AgentApi extends BaseApi {
  protected readonly endpoint = '/agent';

  chat(dto: ChatMessageDto): Observable<ApiResponse<ChatResponse>> {
    return this.apiService.post<ApiResponse<ChatResponse>>(API_ENDPOINTS.AGENT.CHAT, dto);
  }

  getConfigs(): Observable<ApiResponse<AiConfigModel[]>> {
    return this.apiService.get<ApiResponse<AiConfigModel[]>>(API_ENDPOINTS.AGENT.CONFIG, undefined, true);
  }

  upsertConfig(dto: UpsertAiConfigDto): Observable<ApiResponse<AiConfigModel>> {
    return this.apiService.put<ApiResponse<AiConfigModel>>(API_ENDPOINTS.AGENT.CONFIG, dto);
  }

  deleteConfig(provider: AiProviderEnum): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${API_ENDPOINTS.AGENT.CONFIG}/${provider}`);
  }

  // ---- Conversations ----

  createConversation(title?: string): Observable<ApiResponse<ConversationModel>> {
    return this.apiService.post<ApiResponse<ConversationModel>>(
      API_ENDPOINTS.AGENT.CONVERSATIONS, { title },
    );
  }

  getConversations(): Observable<ApiResponse<ConversationModel[]>> {
    return this.apiService.get<ApiResponse<ConversationModel[]>>(
      API_ENDPOINTS.AGENT.CONVERSATIONS, undefined, true,
    );
  }

  getConversation(id: string): Observable<ApiResponse<ConversationWithMessages>> {
    return this.apiService.get<ApiResponse<ConversationWithMessages>>(
      `${API_ENDPOINTS.AGENT.CONVERSATIONS}/${id}`, undefined, true,
    );
  }

  updateConversation(id: string, title: string): Observable<ApiResponse<ConversationModel>> {
    return this.apiService.patch<ApiResponse<ConversationModel>>(
      `${API_ENDPOINTS.AGENT.CONVERSATIONS}/${id}`, { title },
    );
  }

  deleteConversation(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      `${API_ENDPOINTS.AGENT.CONVERSATIONS}/${id}`,
    );
  }
}
