import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from 'joi'
import appConfig from "./app-config";
import { AppConfigService } from "./app-config.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      validationSchema: Joi.object({
        APP_NAME: Joi.string().default('CodeRank API'),
        APP_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        APP_HOST: Joi.string().default('localhost'),
        APP_PORT: Joi.number().default(3000),
	    APP_URL: Joi.string(),
	    CLIENT_URL: Joi.string().required(),
      AGENT_URL: Joi.string().required(),
      AGENT_SECRET_TOKEN: Joi.string().required(),
      })
    })
  ],
  providers: [AppConfigService],
  exports: [AppConfigService]
})
export class AppConfigModule { }