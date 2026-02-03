import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { AuthProviderEntity } from "./entities/auth-provider.entity";
import { TokenEntity } from "./entities/token.entity";
import { SessionEntity } from "./entities/session.entity";
import { UserService } from "./services/user.service";



@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, AuthProviderEntity, TokenEntity, SessionEntity]),
    ],
    controllers: [],
    providers: [
        UserService
    ],
    exports: [
        UserService
    ],
})
export class UserModule {}