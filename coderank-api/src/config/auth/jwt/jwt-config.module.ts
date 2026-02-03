import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi'
import { JwtConfigService } from './jwt-config.service';
import jwtConfig from './jwt-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [jwtConfig],
      validationSchema: Joi.object({
        AUTH_JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
        AUTH_JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
        AUTH_JWT_EMAIL_VERIFICATION_TOKEN_SECRET: Joi.string().required(),
        AUTH_JWT_EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: Joi.string().required(),
        AUTH_JWT_PASSWORD_RESET_TOKEN_SECRET: Joi.string().required(),
        AUTH_JWT_PASSWORD_RESET_TOKEN_EXPIRES_IN: Joi.string().required(),
      })
    })
  ],
  providers: [JwtConfigService],
  exports: [JwtConfigService]
})
export class JwtConfigModule { }