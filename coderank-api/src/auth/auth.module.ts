import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Global()
@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [GoogleStrategy, JwtStrategy, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
