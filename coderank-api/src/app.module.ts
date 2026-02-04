import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootConfigModule } from './config/config.module';
import { RootProviderModule } from './provider/provider.module';
import { RootIntegrationModule } from './integration/integration.module';
import { RootModule } from './module/module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from './auth/guard/jwt.guard';
import { RolesGuard } from './auth/guard/roles.guard';

@Module({
  imports: [
    RootConfigModule,
    RootProviderModule,
    RootIntegrationModule,
    RootModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
})
export class AppModule {}
