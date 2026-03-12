import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/app/app-config.service';
import { RolesEnum } from 'src/common/enums/enums';
import { UserAiConfigEntity } from './entities/user-ai-config.entity';

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
    aiConfig?: UserAiConfigEntity,
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

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${agentUrl}/agent/chat`,
          body,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-agent-secret': agentSecret,
            },
            timeout: 120000,
          },
        ),
      );

      return response.data?.data?.message ?? response.data?.data;
    } catch (error: any) {
      const detail =
        error.response?.data?.error ?? error.message ?? 'Unknown error';
      throw new InternalServerErrorException(
        `Agent service error: ${detail}`,
      );
    }
  }
}