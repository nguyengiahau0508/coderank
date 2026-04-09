import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { Readable } from 'stream';
import { AppConfigService } from 'src/config/app/app-config.service';
import { RolesEnum } from 'src/common/enums/enums';
import { UserAiConfigEntity } from './entities/user-ai-config.entity';
import { ChatContextDto } from './dto/chat-message.dto';

type AgentHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AgentProviderConfig = {
  provider?: UserAiConfigEntity['provider'];
  modelName?: string;
  apiKey?: string;
  baseHost?: string;
};

@Injectable()
export class AgentService {
  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async chat(
    message: string,
    userToken: string,
    role: RolesEnum,
    aiConfig?: AgentProviderConfig,
    history?: AgentHistoryMessage[],
    context?: ChatContextDto,
  ): Promise<string> {
    const agentUrl = this.appConfigService.agent_url;
    const agentSecret = this.appConfigService.agent_secret_token;

    const body: Record<string, unknown> = { message, userToken, role };

    if (aiConfig) {
      body.provider = aiConfig.provider;
      if (aiConfig.modelName) body.modelName = aiConfig.modelName;
      if (aiConfig.apiKey) body.apiKey = aiConfig.apiKey;
      if (aiConfig.baseHost) body.baseHost = aiConfig.baseHost;
    }
    if (history && history.length > 0) {
      body.history = history;
    }
    if (context) {
      body.context = context;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${agentUrl}/agent/chat`, body, {
          headers: {
            'Content-Type': 'application/json',
            'x-agent-secret': agentSecret,
          },
          timeout: 120000,
        }),
      );

      return response.data?.data?.message ?? response.data?.data;
    } catch (error: any) {
      const detail =
        error.response?.data?.error ?? error.message ?? 'Unknown error';
      throw new InternalServerErrorException(`Agent service error: ${detail}`);
    }
  }

  private buildBody(
    message: string,
    userToken: string,
    role: RolesEnum,
    aiConfig?: AgentProviderConfig,
    history?: AgentHistoryMessage[],
    context?: ChatContextDto,
  ): Record<string, unknown> {
    const body: Record<string, unknown> = { message, userToken, role };
    if (aiConfig) {
      body.provider = aiConfig.provider;
      if (aiConfig.modelName) body.modelName = aiConfig.modelName;
      if (aiConfig.apiKey) body.apiKey = aiConfig.apiKey;
      if (aiConfig.baseHost) body.baseHost = aiConfig.baseHost;
    }
    if (history && history.length > 0) {
      body.history = history;
    }
    if (context) {
      body.context = context;
    }
    return body;
  }

  async chatStream(
    message: string,
    userToken: string,
    role: RolesEnum,
    aiConfig?: AgentProviderConfig,
    history?: AgentHistoryMessage[],
    context?: ChatContextDto,
  ): Promise<Readable> {
    const agentUrl = this.appConfigService.agent_url;
    const agentSecret = this.appConfigService.agent_secret_token;
    const body = this.buildBody(
      message,
      userToken,
      role,
      aiConfig,
      history,
      context,
    );

    const response = await this.httpService.axiosRef.post(
      `${agentUrl}/agent/chat/stream`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-agent-secret': agentSecret,
        },
        responseType: 'stream',
        timeout: 120000,
      },
    );

    return response.data as Readable;
  }

  async gradeAssignmentSubmissions(
    payload: {
      courseId: string;
      lessonId: string;
      assignmentId: string;
      submissionIds: string[];
      similarityThreshold: number;
      defaultMaxScore: number;
      gradingCriteria?: Array<{
        criterion: string;
        description?: string;
        maxScore: number;
      }>;
      assignmentTitle?: string;
      assignmentDescription?: string;
    },
    userToken: string,
    role: RolesEnum,
    aiConfig?: AgentProviderConfig,
  ): Promise<{
    assignmentId: string;
    gradedCount: number;
    flaggedCount: number;
    results: Array<{
      submissionId: string;
      score?: number;
      status?: string;
      feedback?: string;
      aiGradingResult?: any;
      isSimilarityFlagged?: boolean;
      maxSimilarityScore?: number;
      similarityMatches?: any[];
    }>;
  }> {
    const agentUrl = this.appConfigService.agent_url;
    const agentSecret = this.appConfigService.agent_secret_token;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${agentUrl}/agent/grade-assignment-submissions`,
          {
            userToken,
            role,
            ...payload,
            provider: aiConfig?.provider,
            modelName: aiConfig?.modelName,
            apiKey: aiConfig?.apiKey,
            baseHost: aiConfig?.baseHost,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-agent-secret': agentSecret,
            },
            timeout: 600000,
          },
        ),
      );

      return response.data?.data ?? response.data;
    } catch (error: any) {
      const detail =
        error.response?.data?.error ?? error.message ?? 'Unknown error';
      throw new InternalServerErrorException(`Agent service error: ${detail}`);
    }
  }
}
