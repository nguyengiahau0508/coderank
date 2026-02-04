import { Global, Module } from '@nestjs/common';
import { AppConfigModule } from './app/app-config.module';
import { JwtConfigModule } from './auth/jwt/jwt-config.module';
import { MariadbConfigModule } from './db/mariadb/mariadb-config.module';
import { GithubConfigModule } from './integrations/github/github-config.module';
import { GoogleConfigModule } from './integrations/google/google-config.module';

@Global()
@Module({
  imports: [
    AppConfigModule,
    JwtConfigModule,
    MariadbConfigModule,
    GithubConfigModule,
    GoogleConfigModule,
  ],
  exports: [
    AppConfigModule,
    JwtConfigModule,
    MariadbConfigModule,
    GithubConfigModule,
    GoogleConfigModule,
  ],
})
export class RootConfigModule {}
