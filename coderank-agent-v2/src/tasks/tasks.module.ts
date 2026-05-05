import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { TaskRegistryService } from './task-registry.service';
import { TasksController } from './tasks.controller';

@Module({
  imports: [EventsModule],
  controllers: [TasksController],
  providers: [TaskRegistryService],
  exports: [TaskRegistryService],
})
export class TasksModule {}
