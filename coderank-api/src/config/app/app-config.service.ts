import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configurationService: ConfigService) {}

  get name(): string {
    return this.configurationService.get<string>(
      'appConfig.name',
      'CodeRank API',
    );
  }

  get env(): string {
    return this.configurationService.get<string>(
      'appConfig.env',
      'development',
    );
  }

  get port(): number {
    return Number(
      this.configurationService.get<number>('appConfig.port', 3000),
    );
  }

  get host(): string {
    return this.configurationService.get<string>('appConfig.host', 'localhost');
  }

  get url(): string {
    return this.configurationService.get<string>(
      'appConfig.url',
      'http://localhost:3000',
    );
  }

  get client_url(): string {
    return this.configurationService.get<string>(
      'appConfig.client_url',
      'http://localhost:4200',
    );
  }

  get agent_url(): string {
    return this.configurationService.get<string>(
      'appConfig.agent_url',
      'http://localhost:4000',
    );
  }

  get agent_secret_token(): string {
    return this.configurationService.get<string>(
      'appConfig.agent_secret_token',
      '',
    );
  }
}
