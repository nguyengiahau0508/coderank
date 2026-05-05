import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { WorkerRegistryService } from './worker-registry.service';
import { WorkerStateMachineService } from './worker-state-machine.service';
import { WorkersController } from './workers.controller';

@Module({
  imports: [EventsModule],
  controllers: [WorkersController],
  providers: [WorkerStateMachineService, WorkerRegistryService],
  exports: [WorkerRegistryService, WorkerStateMachineService],
})
export class WorkersModule {}
