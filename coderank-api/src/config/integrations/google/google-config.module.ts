import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi'
import { GoogleConfigService } from './google-config.service';
import googleConfig from './google-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [googleConfig],
      validationSchema: Joi.object({
        INTEGRATIONS_GOOGLE_CLIENT_ID: Joi.string().required(),
        INTEGRATIONS_GOOGLE_CLIENT_SECRET: Joi.string().required()
      })
    })
  ],
  providers: [GoogleConfigService],
  exports: [GoogleConfigService]
})
export class GoogleConfigModule { }