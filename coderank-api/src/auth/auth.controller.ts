import { Controller, Get, HttpStatus, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport/dist/auth.guard";
import { AuthProvidersEnum } from "src/common/enums/enums";
import express from "express";
import { AuthService } from "./auth.service";
import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiOAuth2,
    ApiExcludeEndpoint,
    ApiBearerAuth
} from "@nestjs/swagger";

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
    @UseGuards(AuthGuard(AuthProvidersEnum.Google))
    @ApiOperation({ 
        summary: 'Đăng nhập với Google',
        description: 'Khởi tạo OAuth2 flow để đăng nhập với tài khoản Google. Người dùng sẽ được chuyển hướng đến trang đăng nhập Google.'
    })
    @ApiResponse({ 
        status: HttpStatus.FOUND, 
        description: 'Redirect to Google OAuth consent screen' 
    })
    @ApiOAuth2(['email', 'profile'], 'Google-OAuth2')
    async authenticateWithGoogle() {
        // Redirect to Google's OAuth flow
    }

    /**
     * Handle Google OAuth2 callback
     */
    @Get(`${AuthProvidersEnum.Google}/callback`)
    @UseGuards(AuthGuard(AuthProvidersEnum.Google))
    @ApiOperation({ 
        summary: 'Google OAuth2 Callback',
        description: 'Endpoint xử lý callback từ Google sau khi người dùng xác thực. Trả về JWT tokens.'
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Authentication successful',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    description: 'JWT access token',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.UNAUTHORIZED, 
        description: 'Authentication failed - Invalid credentials or token' 
    })
    @ApiExcludeEndpoint() // Exclude from main docs as it's a callback
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