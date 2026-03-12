import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { UserAiConfigService } from './user-ai-config.service';
import { UserAiConfigEntity } from './entities/user-ai-config.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 120000,
    }),
    TypeOrmModule.forFeature([UserAiConfigEntity]),
  ],
  providers: [AgentService, UserAiConfigService],
  controllers: [AgentController],
})
export class AgentModule {}