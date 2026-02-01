import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GithubConfigService {
  constructor(private configurationService: ConfigService) { }

  get clientId(): string | undefined {
    return this.configurationService.get<string>('githubConfig.clientId')
  }

  get clientSecret(): string | undefined {
    return this.configurationService.get<string>('githubConfig.clientSecret')
  }
}