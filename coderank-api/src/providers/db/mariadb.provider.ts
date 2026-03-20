import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { MariadbConfigModule } from 'src/config/db/mariadb/mariadb-config.module';
import { MariadbConfigService } from 'src/config/db/mariadb/mariadb-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [MariadbConfigModule],
      useFactory: async (mariadbConfigService: MariadbConfigService) => {
        return {
          type: 'mariadb',
          host: mariadbConfigService.host,
          port: mariadbConfigService.port,
          username: mariadbConfigService.username,
          password: mariadbConfigService.password,
          database: mariadbConfigService.dbName,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [MariadbConfigService],
    } as TypeOrmModuleAsyncOptions),
  ],
})
export default class MariadbProviderModule {}
