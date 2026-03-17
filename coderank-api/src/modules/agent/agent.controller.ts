import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { UserAiConfigService } from './user-ai-config.service';
import { ConversationService } from './conversation.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { UpsertAiConfigDto } from './dto/upsert-ai-config.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AiProviderEnum } from 'src/common/enums/enums';
import type { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import type { Request, Response } from 'express';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly userAiConfigService: UserAiConfigService,
    private readonly conversationService: ConversationService,
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

    let aiConfig;
    if (dto.provider) {
      aiConfig = await this.userAiConfigService.findByUserIdAndProviderWithApiKey(
        currentUser.userId,
        dto.provider,
      );
    }

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
  @ApiOperation({ summary: 'Get all AI configs for current user' })
  async getConfigs(@CurrentUser() currentUser: IJwtPayload) {
    return this.userAiConfigService.findAllByUserId(currentUser.userId);
  }

  @Put('config')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create or update AI config for a provider' })
  async upsertConfig(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() dto: UpsertAiConfigDto,
  ) {
    return this.userAiConfigService.upsert(currentUser.userId, dto);
  }

  @Delete('config/:provider')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete AI config for a specific provider' })
  async deleteConfig(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('provider') provider: AiProviderEnum,
  ) {
    await this.userAiConfigService.removeByProvider(currentUser.userId, provider);
  }

  // ==================== Conversations ====================

  @Post('conversations')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new conversation' })
  async createConversation(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() body: { title?: string },
  ) {
    return this.conversationService.create(currentUser.userId, body.title);
  }

  @Get('conversations')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all conversations for current user' })
  async getConversations(@CurrentUser() currentUser: IJwtPayload) {
    return this.conversationService.findAllByUser(currentUser.userId);
  }

  @Get('conversations/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get conversation with messages' })
  async getConversation(
    @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    return this.conversationService.findOneWithMessages(id, currentUser.userId);
  }

  @Patch('conversations/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Rename a conversation' })
  async updateConversation(
    @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
    @Body() body: { title: string },
  ) {
    return this.conversationService.updateTitle(id, currentUser.userId, body.title);
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a conversation' })
  async deleteConversation(
    @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    await this.conversationService.remove(id, currentUser.userId);
  }

  @Post('conversations/:id/messages')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send a message in a conversation (SSE streaming)' })
  async sendConversationMessage(
    @Param('id') id: string,
    @Body() dto: ChatMessageDto,
    @CurrentUser() currentUser: IJwtPayload,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const conv = await this.conversationService.findOneWithMessages(id, currentUser.userId);
    const history = (conv.messages || [])
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    await this.conversationService.addMessage(id, 'user', dto.message);

    if (conv.title === 'New Chat') {
      const title = dto.message.length > 80 ? dto.message.substring(0, 77) + '...' : dto.message;
      await this.conversationService.updateTitle(id, currentUser.userId, title);
    }

    let aiConfig;
    if (dto.provider) {
      aiConfig = await this.userAiConfigService.findByUserIdAndProviderWithApiKey(
        currentUser.userId, dto.provider,
      );
    }

    const userToken = (req.headers.authorization as string)?.replace('Bearer ', '');
    const role = currentUser.roles?.[0];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullContent = '';

    try {
      const stream = await this.agentService.chatStream(
        dto.message, userToken, role, aiConfig ?? undefined, history,
      );

      stream.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        res.write(text);

        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.type === 'token') {
                fullContent += data.content;
              }
            } catch {}
          }
        }
      });

      stream.on('end', async () => {
        if (fullContent) {
          await this.conversationService.addMessage(id, 'assistant', fullContent);
        }
        res.end();
      });

      stream.on('error', (err) => {
        res.write(`data: ${JSON.stringify({ type: 'error', content: (err as Error).message })}\n\n`);
        res.end();
      });
    } catch (error: any) {
      res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
      res.end();
    }
  }
}