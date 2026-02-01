import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { AuthProviderEntity } from "./entities/auth-provider.entity";
import { TokenEntity } from "./entities/token.entity";



@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, AuthProviderEntity, TokenEntity]),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class UserModule {}