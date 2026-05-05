import { Module } from '@nestjs/common';
import { AgentsModule } from './agents/agents.module';
import { ApiModule } from './api/api.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProvidersModule } from './providers/providers.module';
import { RuntimeModule } from './runtime/runtime.module';
import { SessionsModule } from './sessions/sessions.module';
import { TasksModule } from './tasks/tasks.module';
import { ToolsModule } from './tools/tools.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    EventsModule,
    ApiModule,
    PermissionsModule,
    ProvidersModule,
    SessionsModule,
    AgentsModule,
    TasksModule,
    WorkersModule,
    ToolsModule,
    RuntimeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
