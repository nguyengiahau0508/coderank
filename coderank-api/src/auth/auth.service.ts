import { Injectable } from "@nestjs/common";
import { AuthProvidersEnum, TokenTypeEnum } from "src/common/enums/enums";
import { UserService } from "src/module/user/services/user.service";
import { GoogleLoginDto } from "./dto/login/google-login-dto";
import { TokenService } from "src/module/user/services/token.service";
import {  generateUsernameFromEmail } from "src/common/helpers/username.helper";
import { AuthProviderService } from "src/module/user/services/auth-provider.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly authProviderService: AuthProviderService,
    ) { }

    async validateOrCreateUser(dto: GoogleLoginDto, provider: AuthProvidersEnum) {
        let currentUser = await this.userService.findOne({
            where: {
                email: dto.email,
                authProviders:{
                    providerName: provider,
                    providerId: dto.providerId
                }
            }
        })
        if (!currentUser){
            currentUser = await this.userService.create({
                email: dto.email,
                fullName: dto.fullName,
                username: generateUsernameFromEmail(dto.email),
                avatarUrl: dto.picture,
            })
            const authProvider = await this.authProviderService.create({
                userId: currentUser.id,
                providerName: provider,
                providerId: dto.providerId,
            })
            currentUser.authProviders = [authProvider];
        }

        const refreshToken = await this.tokenService.generateToken({
            userId: currentUser.id,
            type: TokenTypeEnum.REFRESH,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        const accessToken = await this.tokenService.generateToken({
            userId: currentUser.id,
            type: TokenTypeEnum.ACCESS,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        });
        
        return {
            refreshToken,
            accessToken,
        };
    }
}