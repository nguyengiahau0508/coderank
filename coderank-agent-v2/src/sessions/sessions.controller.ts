import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionTurnDto } from './dto/session-turn.dto';
import { SessionContextService } from './session-context.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionContextService) {}

  @Post()
  createSession(@Body() dto: CreateSessionDto) {
    return this.sessions.create(dto);
  }

  @Get(':id')
  getSession(@Param('id') id: string) {
    return this.sessions.get(id);
  }

  @Get(':id/context')
  getSessionContext(@Param('id') id: string) {
    return {
      sessionId: id,
      contextSummary: this.sessions.getContextSummary(id),
    };
  }

  @Get()
  listSessions() {
    return this.sessions.list();
  }

  @Post(':id/turns')
  appendTurn(@Param('id') id: string, @Body() dto: SessionTurnDto) {
    return this.sessions.appendTurn(id, dto);
  }
}
