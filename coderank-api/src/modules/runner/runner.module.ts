import { Module } from "@nestjs/common";
import { RunnerController } from "./runner.controller";
import { RunnerService } from "./services/runner.service";
import { CheckerService } from "./services/checker.service";
import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { RunnerProcessor } from "./processor/runner.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'runner-queue',
    }),
    BullBoardModule.forFeature({
      name: 'runner-queue',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [RunnerController],
  providers: [RunnerService, CheckerService, RunnerProcessor],
  exports: [RunnerService, CheckerService]
})

export class RunnerModule { }
