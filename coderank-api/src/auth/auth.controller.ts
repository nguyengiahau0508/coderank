import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport/dist/auth.guard";
import { AuthProvidersEnum } from "src/common/enums/enums";



@Controller("auth")
export class AuthController {
    @Get(`${AuthProvidersEnum.Google}`)
    @UseGuards(AuthGuard(AuthProvidersEnum.Google))
    async authenticateWithGoogle() {
        // Redirect to Google's OAuth flow
    }

    @Get(`${AuthProvidersEnum.Google}/callback`)
    @UseGuards(AuthGuard(AuthProvidersEnum.Google))
    async googleCallback(@Req() req: Request, @Res() res: Response) {
        
    }
}