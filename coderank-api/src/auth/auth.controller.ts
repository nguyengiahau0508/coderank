import { Controller, Get, Post, Req, Res, UseGuards, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport/dist/auth.guard";
import { AuthProvidersEnum, RolesEnum } from "src/common/enums/enums";
import express from "express";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";
import { ApiGoogleAuth, ApiGoogleCallback, ApiLogout, ApiProtectedResource, ApiRefreshToken, Public, Roles } from "./decorators";
import { ResponseMessage, SkipTransform } from "src/common/decorators";
import { Throttle } from "@nestjs/throttler";
import { RolesGuard } from "./guards/roles.guard";
/**
 * Authentication Controller
 * 
 * Handles all authentication-related endpoints including OAuth2 flows
 * for Google, GitHub, and local authentication.
 */
@ApiTags('Authentication')
@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    /**
     * Initiate Google OAuth2 authentication flow
     */
    @Get(`${AuthProvidersEnum.Google}`)
    @Public()
    @UseGuards(AuthGuard(AuthProvidersEnum.Google))
    @ApiGoogleAuth()
    async authenticateWithGoogle() {
        // Redirect to Google's OAuth flow
    }

    /**
     * Handle Google OAuth2 callback
     */
    @Get(`${AuthProvidersEnum.Google}/callback`)
    @Public()
    @UseGuards(AuthGuard(AuthProvidersEnum.Google))
    @ResponseMessage('Google authentication successful')
    @ApiGoogleCallback()
    async googleCallback(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';

        const userData = {
            ...req.user,
            userAgent,
            ipAddress,
        };
        
        const {
            accessToken,
            refreshToken
        } = await this.authService.validateOrCreateUser(userData as any, AuthProvidersEnum.Google);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return { accessToken };
    }

    @Get('logout')
    @ApiLogout()
    async logout(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        const userId = req.user?.['userId'];
        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }

        const refreshToken = req.cookies?.['refreshToken'];
        const accessToken = req.headers?.authorization?.split(' ')[1];
        if (!accessToken || !refreshToken) {
            throw new BadRequestException('Missing tokens');
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        
        const logoutSuccess = await this.authService.logout(userId, accessToken, refreshToken);
        return { loggedOut: logoutSuccess };
    }

    @Post('refresh-tokens')
    @Public()
    @ApiRefreshToken()
    async refreshAccessTokens(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        const refreshToken = req.cookies?.['refreshToken'];
        if (!refreshToken) {
            throw new BadRequestException('Missing refresh token');
        }

        const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';
        const { accessToken } = await this.authService.refreshTokens(ipAddress, refreshToken);

        return { accessToken };
    }

    // @Get('test-protected')
    // @Roles(RolesEnum.Admin)
    // @ApiProtectedResource('Test Protected Endpoint', 'Endpoint to test access to a protected resource')
    // async testProtectedEndpoint(@Req() req: express.Request) {
    //     return {
    //         message: 'You have accessed a protected endpoint',
    //         user: req.user,
    //     };
    // }
}