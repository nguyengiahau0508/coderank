import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entities/user.entity';
import { AuthProvidersEntity } from './entities/auth-provider.entity';
import { TokensEntity } from './entities/token.entity';
import { SessionsEntity } from './entities/session.entity';
import { UsersService } from './services/user.service';
import { TokensService } from './services/token.service';
import { SessionsService } from './services/session.service';
import { AuthProvidersService } from './services/auth-provider.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigModule } from 'src/config/auth/jwt/jwt-config.module';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      AuthProvidersEntity,
      TokensEntity,
      SessionsEntity,
    ]),
    JwtConfigModule,
    JwtModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    TokensService,
    SessionsService,
    AuthProvidersService,
  ],
  exports: [UsersService, TokensService, SessionsService, AuthProvidersService],
})
export class UsersModule {}
