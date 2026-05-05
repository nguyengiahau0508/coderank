import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { SessionsModule } from '../sessions/sessions.module';
import { AgentService } from './agents.service';
import { AgentsController } from './agents.controller';

@Module({
  imports: [PermissionsModule, SessionsModule],
  controllers: [AgentsController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentsModule {}
