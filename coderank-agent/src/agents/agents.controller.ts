import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { AgentService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agents: AgentService) {}

  @Post()
  async createAgent(
    @Body() dto: CreateAgentDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.agents.createAndStart(dto, {
      accessToken: this.extractBearerToken(authorization),
    });
  }

  @Get(':id')
  getAgent(@Param('id') id: string) {
    return this.agents.get(id);
  }

  @Get(':id/manifest')
  getManifest(@Param('id') id: string) {
    return this.agents.get(id);
  }

  @Get()
  listAgents() {
    return this.agents.list();
  }

  @Post(':id/stop')
  async stopAgent(@Param('id') id: string) {
    return this.agents.stop(id);
  }

  private extractBearerToken(authorization?: string): string | undefined {
    if (!authorization) {
      return undefined;
    }

    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return undefined;
    }

    const token = match[1]?.trim();
    return token || undefined;
  }
}
