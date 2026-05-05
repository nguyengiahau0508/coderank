import { Module } from '@nestjs/common';
import { RuntimeLoopService } from '../core/agent/runtime-loop.service';
import { RUNTIME_LOOP } from '../core/agent/runtime.tokens';
import { ProvidersModule } from '../providers/providers.module';
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [ProvidersModule, ToolsModule],
  providers: [
    RuntimeLoopService,
    {
      provide: RUNTIME_LOOP,
      useExisting: RuntimeLoopService,
    },
  ],
  exports: [RuntimeLoopService, RUNTIME_LOOP],
})
export class RuntimeModule {}
