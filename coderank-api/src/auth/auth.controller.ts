import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport/dist/auth.guard";
import { AuthProvidersEnum } from "src/common/enums/enums";
import express from "express";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }
    @Get(`${AuthProvidersEnum.Google}`)
    @UseGuards(AuthGuard(AuthProvidersEnum.Google))
    async authenticateWithGoogle() {
        // Redirect to Google's OAuth flow
    }

    @Get(`${AuthProvidersEnum.Google}/callback`)
    @UseGuards(AuthGuard(AuthProvidersEnum.Google))
    async googleCallback(@Req() req: express.Request, @Res() res: express.Response) {
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

        res.json({
            accessToken,
        });
    }
}