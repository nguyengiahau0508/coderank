import { Module } from '@nestjs/common';
import { AgentsModule } from '../agents/agents.module';
import { ApiModule } from '../api/api.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { TasksModule } from '../tasks/tasks.module';
import { WorkersModule } from '../workers/workers.module';
import { ToolDispatcherService } from '../core/tools/tool-dispatcher.service';

@Module({
  imports: [
    ApiModule,
    PermissionsModule,
    TasksModule,
    WorkersModule,
    AgentsModule,
  ],
  providers: [ToolDispatcherService],
  exports: [ToolDispatcherService],
})
export class ToolsModule {}
