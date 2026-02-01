import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootConfigModule } from './config/config.module';
import { RootProviderModule } from './provider/provider.module';

@Module({
  imports: [
    RootConfigModule,
    RootProviderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
