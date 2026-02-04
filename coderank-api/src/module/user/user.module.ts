import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { AuthProviderEntity } from "./entities/auth-provider.entity";
import { TokenEntity } from "./entities/token.entity";
import { SessionEntity } from "./entities/session.entity";
import { UserService } from "./services/user.service";
import { TokenService } from "./services/token.service";
import { SessionService } from "./services/session.service";
import { AuthProviderService } from "./services/auth-provider.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtConfigModule } from "src/config/auth/jwt/jwt-config.module";



@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, AuthProviderEntity, TokenEntity, SessionEntity]),
        JwtConfigModule,
        JwtModule,
    ],
    controllers: [],
    providers: [
        UserService,
        TokenService,
        SessionService,
        AuthProviderService
    ],
    exports: [
        UserService,
        TokenService,
        SessionService,
        AuthProviderService
    ],
})
export class UserModule {}