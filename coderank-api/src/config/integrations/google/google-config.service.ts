import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleConfigService {
  constructor(private configurationService: ConfigService) { }

  get clientId(): string | undefined {
    return this.configurationService.get<string>('googleConfig.clientId')
  }

  get clientSecret(): string | undefined {
    return this.configurationService.get<string>('googleConfig.clientSecret')
  }
}