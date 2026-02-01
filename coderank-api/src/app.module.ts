import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootConfigModule } from './config/config.module';
import { RootProviderModule } from './provider/provider.module';
import { RootIntegrationModule } from './integration/integration.module';
import { RootModule } from './module/module';

@Module({
  imports: [
    RootConfigModule,
    RootProviderModule,
    RootIntegrationModule,
    RootModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
