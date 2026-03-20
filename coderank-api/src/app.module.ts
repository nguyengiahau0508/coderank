import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootConfigModule } from './config/config.module';
import { RootProviderModule } from './providers/provider.module';
import { RootIntegrationModule } from './integrations/integration.module';
import { RootModule } from './modules/module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { OwnerGuard } from './auth/guards/owner.guard';

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
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OwnerGuard,
    },
  ],
})
export class AppModule {}
