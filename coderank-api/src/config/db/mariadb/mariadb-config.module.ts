import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import mariadbConfig from './mariadb-config';
import { MariadbConfigService } from './mariadb-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [mariadbConfig],
      validationSchema: Joi.object({
        DB_MARIADB_HOST: Joi.string().default('localhost'),
        DB_MARIADB_PORT: Joi.number().default(3306),
        DB_MARIADB_USERNAME: Joi.string().default('root'),
        DB_MARIADB_PASSWORD: Joi.string().required(),
        DB_MARIADB_NAME: Joi.string().required(),
      }),
    }),
  ],
  providers: [MariadbConfigService],
  exports: [MariadbConfigService],
})
export class MariadbConfigModule {}
