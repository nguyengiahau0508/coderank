import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleConfigService {
  constructor(private configurationService: ConfigService) { }

  get clientId(): string  {
    return this.configurationService.get<string>('googleConfig.clientId', '')
  }

  get clientSecret(): string {
    return this.configurationService.get<string>('googleConfig.clientSecret', '')
  }

  get oauth2ClientEmail(): string  {
    return this.configurationService.get<string>('googleConfig.oauth2ClientEmail', '')
  }

  get oauth2PrivateKey(): string  {
    return this.configurationService.get<string>('googleConfig.oauth2PrivateKey', '')
  }

  get driveFolderId(): string  {
    return this.configurationService.get<string>('googleConfig.driveFolderId', '')
  }
}