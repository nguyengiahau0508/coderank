import { Injectable } from "@nestjs/common";
import { AuthProvidersEnum, SessionStatusEnum, TokenTypeEnum } from "src/common/enums/enums";
import { UsersService } from "src/modules/users/services/user.service";
import { GoogleLoginDto } from "./dto/login/google-login-dto";
import { TokensService } from "src/modules/users/services/token.service";
import {  generateUsernameFromEmail } from "src/common/helpers/username.helper";
import { AuthProvidersService } from "src/modules/users/services/auth-provider.service";
import { SessionsService } from "src/modules/users/services/session.service";
import { IJwtPayload } from "src/common/interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly tokensService: TokensService,
        private readonly authProvidersService: AuthProvidersService,
        private readonly sessionsService: SessionsService,
    ) { }

    async validateOrCreateUser(dto: GoogleLoginDto, provider: AuthProvidersEnum) {
        let currentUser = await this.usersService.findOne({
            where: {
                email: dto.email,
                authProviders:{
                    providerName: provider,
                    providerId: dto.providerId
                }
            }
        })
        if (!currentUser){
            currentUser = await this.usersService.create({
                email: dto.email,
                fullName: dto.fullName,
                username: generateUsernameFromEmail(dto.email),
                avatarUrl: dto.picture,
            })
            const authProvider = await this.authProvidersService.create({
                userId: currentUser.id,
                providerName: provider,
                providerId: dto.providerId,
            })
            currentUser.authProviders = [authProvider];
        }

        const tokenPayload : IJwtPayload = {
            userId: currentUser.id,
            roles: currentUser.roles,
        }

        const refreshToken = await this.tokensService.generateToken({
            userId: currentUser.id,
            type: TokenTypeEnum.REFRESH,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            payload: tokenPayload,
        });

        const accessToken = await this.tokensService.generateToken({
            userId: currentUser.id,
            type: TokenTypeEnum.ACCESS,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            payload: tokenPayload,
        });

        const session = await this.sessionsService.create({
            userId: currentUser.id,
            sessionToken: accessToken,
            refreshToken: refreshToken,
            userAgent: dto.userAgent, // Assuming userAgent is part of dto
            ipAddress: dto.ipAddress, // Assuming ipAddress is part of dto
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        return {
            refreshToken,
            accessToken,
            session,
        };
    }

    async logout(userId: string,accessToken:string, refreshToken: string) {
        const isAccessTokenResvoked = await this.tokensService.revokeToken(accessToken, TokenTypeEnum.ACCESS);
        const isRefreshTokenRevoked = await this.tokensService.revokeToken(refreshToken, TokenTypeEnum.REFRESH);

        const currentSession = await this.sessionsService.findOne({
            where: {
                userId,
                refreshToken,
                status: SessionStatusEnum.Active,
            },
        });
        if (!currentSession) {
            return false;
        }

        const updatedSession = await this.sessionsService.update(currentSession.id, {
            status: SessionStatusEnum.Revoked
        });

        return isAccessTokenResvoked && isRefreshTokenRevoked && !!updatedSession;
    }

    async refreshTokens(ipAddress: string, refreshToken: string) {
        const jwtPayload: IJwtPayload = await this.tokensService.verifyToken(refreshToken, TokenTypeEnum.REFRESH);
        const currentUser = await this.usersService.findById(jwtPayload.userId);
        if (!currentUser) {
            throw new Error('User not found');
        }

        const currentSession = await this.sessionsService.findOne({
            where: {
                userId: currentUser.id,
                refreshToken,
                status: SessionStatusEnum.Active,
            },
        });

        if (!currentSession) {
            throw new Error('No active session found for this refresh token');
        }

        if (currentSession.ipAddress !== ipAddress) {
            await this.sessionsService.update(currentSession.id, {
                status: SessionStatusEnum.Revoked,
            });
            await this.tokensService.revokeToken(refreshToken, TokenTypeEnum.REFRESH);

            throw new Error('IP address mismatch');
        }

        const tokenPayload : IJwtPayload = {
            userId: currentUser.id,
            roles: currentUser.roles,
        }

        const newAccessToken = await this.tokensService.generateToken({
            userId: currentUser.id,
            type: TokenTypeEnum.ACCESS,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            payload: tokenPayload,
        });

        return {
            accessToken: newAccessToken,
        };
    }
}