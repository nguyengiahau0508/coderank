import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { GithubConfigService } from './github-config.service';
import githubConfig from './github-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [githubConfig],
      validationSchema: Joi.object({
        INTEGRATIONS_GITHUB_CLIENT_ID: Joi.string().required(),
        INTEGRATIONS_GITHUB_CLIENT_SECRET: Joi.string().required(),
      }),
    }),
  ],
  providers: [GithubConfigService],
  exports: [GithubConfigService],
})
export class GithubConfigModule {}
