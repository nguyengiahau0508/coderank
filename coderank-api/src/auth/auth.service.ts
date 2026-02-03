import { Injectable } from "@nestjs/common";
import { AuthProvidersEnum } from "src/common/enums/enums";
import { UserService } from "src/module/user/services/user.service";
import { GoogleLoginDto } from "./dto/login/google-login-dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
    ) { }

    async validateOrCreateUser(dto: GoogleLoginDto, provider: AuthProvidersEnum) {
        
    }
}