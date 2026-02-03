import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { GoogleStrategy } from "./strategies/google.strategy";
import { AuthService } from "./auth.service";
import { UserModule } from "src/module/user/user.module";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Global()
@Module({
    imports: [
        UserModule,
    ],
    controllers: [AuthController],
    providers: [
        GoogleStrategy,
        JwtStrategy,
        AuthService,
    ],
    exports: [AuthService],
})
export class AuthModule {}