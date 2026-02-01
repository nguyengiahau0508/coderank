import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootConfigModule } from './config/config.module';

@Module({
  imports: [
    RootConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
