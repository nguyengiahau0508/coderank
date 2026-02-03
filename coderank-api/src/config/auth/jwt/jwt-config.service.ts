import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtConfigService {
    constructor(private configurationService: ConfigService) { }

    get accessSecret(): string  {
        return this.configurationService.get<string>('jwtConfig.accessSecret', 'defaultAccessSecret');
    }

    get refreshSecret(): string {
        return this.configurationService.get<string>('jwtConfig.refreshSecret' , 'defaultRefreshSecret');
    }

    get accessExpiresIn(): string {
        return this.configurationService.get<string>('jwtConfig.accessExpiresIn', 'defaultAccessExpiresIn')
    }

    get refreshExpiresIn(): string {
        return this.configurationService.get<string>('jwtConfig.refreshExpiresIn', 'defaultRefreshExpiresIn')
    }

    get emailVerificationSecret(): string  {
        return this.configurationService.get<string>('jwtConfig.emailVerificationSecret', 'defaultEmailVerificationSecret')
    }
    get emailVerificationExpiresIn(): string {
        return this.configurationService.get<string>('jwtConfig.emailVerificationExpiresIn', 'defaultEmailVerificationExpiresIn')
    }

    get passwordResetSecret(): string {
        return this.configurationService.get<string>('jwtConfig.passwordResetSecret', 'defaultPasswordResetSecret')
    }

    get passwordResetExpiresIn(): string {
        return this.configurationService.get<string>('jwtConfig.passwordResetExpiresIn', 'defaultPasswordResetExpiresIn')
    }
}