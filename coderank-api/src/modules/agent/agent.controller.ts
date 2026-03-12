import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { UserAiConfigService } from './user-ai-config.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { UpsertAiConfigDto } from './dto/upsert-ai-config.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import type { Request } from 'express';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly userAiConfigService: UserAiConfigService,
  ) {}

  // ==================== Chat ====================

  @Post('chat')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Chat with AI agent' })
  @ApiResponse({ status: 200, description: 'Agent response message' })
  async chat(
    @Body() dto: ChatMessageDto,
    @CurrentUser() currentUser: IJwtPayload,
    @Req() req: Request,
  ) {
    const userToken = (req.headers.authorization as string)?.replace('Bearer ', '');
    const role = currentUser.roles?.[0];
    const aiConfig = await this.userAiConfigService.findByUserIdWithApiKey(currentUser.userId);

    const message = await this.agentService.chat(
      dto.message,
      userToken,
      role,
      aiConfig ?? undefined,
    );

    return { message };
  }

  // ==================== AI Config ====================

  @Get('config')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user AI config' })
  async getConfig(@CurrentUser() currentUser: IJwtPayload) {
    const config = await this.userAiConfigService.findByUserId(currentUser.userId);
    return config ?? {};
  }

  @Put('config')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create or update user AI config' })
  async upsertConfig(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() dto: UpsertAiConfigDto,
  ) {
    return this.userAiConfigService.upsert(currentUser.userId, dto);
  }

  @Delete('config')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user AI config (reset to default)' })
  async deleteConfig(@CurrentUser() currentUser: IJwtPayload) {
    await this.userAiConfigService.remove(currentUser.userId);
  }
}