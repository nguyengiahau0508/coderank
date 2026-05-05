import { Module } from '@nestjs/common';
import { SessionContextService } from './session-context.service';
import { SessionsController } from './sessions.controller';

@Module({
  controllers: [SessionsController],
  providers: [SessionContextService],
  exports: [SessionContextService],
})
export class SessionsModule {}
