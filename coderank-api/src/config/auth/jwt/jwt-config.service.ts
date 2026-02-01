import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtConfigService {
    constructor(private configurationService: ConfigService) { }

    get accessSecret(): string | undefined {
        return this.configurationService.get<string>('jwtConfig.accessSecret')
    }

    get refreshSecret(): string | undefined {
        return this.configurationService.get<string>('jwtConfig.refreshSecret')
    }

    get accessExpiresIn(): string | undefined {
        return this.configurationService.get<string>('jwtConfig.accessExpiresIn')
    }

    get refreshExpiresIn(): string | undefined {
        return this.configurationService.get<string>('jwtConfig.refreshExpiresIn')
    }
}