import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport/dist/auth.guard";
import { AuthProvidersEnum } from "src/common/enums/enums";
import express from "express";

@Controller("auth")
export class AuthController {
    @Get(`${AuthProvidersEnum.Google}`)
    @UseGuards(AuthGuard(AuthProvidersEnum.Google))
    async authenticateWithGoogle() {
        // Redirect to Google's OAuth flow
    }

    @Get(`${AuthProvidersEnum.Google}/callback`)
    @UseGuards(AuthGuard(AuthProvidersEnum.Google))
    async googleCallback(@Req() req: express.Request, @Res() res: express.Response) {
        console.log(req.user);
    }
}