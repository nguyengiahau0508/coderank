import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationMessageEntity } from './entities/conversation-message.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(ConversationMessageEntity)
    private readonly messageRepo: Repository<ConversationMessageEntity>,
  ) {}

  async create(userId: string, title?: string): Promise<ConversationEntity> {
    const conv = this.conversationRepo.create({
      title: title || 'New Chat',
      authorId: userId,
    });
    return this.conversationRepo.save(conv);
  }

  async findAllByUser(userId: string): Promise<ConversationEntity[]> {
    return this.conversationRepo.find({
      where: { authorId: userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOneWithMessages(
    id: string,
    userId: string,
  ): Promise<ConversationEntity> {
    const conv = await this.conversationRepo.findOne({
      where: { id, authorId: userId },
      relations: ['messages'],
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    // Sort messages by createdAt ascending
    conv.messages?.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return conv;
  }

  async updateTitle(
    id: string,
    userId: string,
    title: string,
  ): Promise<ConversationEntity> {
    const conv = await this.findOneByUser(id, userId);
    conv.title = title;
    return this.conversationRepo.save(conv);
  }

  async remove(id: string, userId: string): Promise<void> {
    const conv = await this.findOneByUser(id, userId);
    await this.conversationRepo.softRemove(conv);
  }

  async addMessage(
    conversationId: string,
    role: string,
    content: string,
  ): Promise<ConversationMessageEntity> {
    // Touch conversation's updatedAt
    await this.conversationRepo.update(conversationId, {});
    const msg = this.messageRepo.create({ conversationId, role, content });
    return this.messageRepo.save(msg);
  }

  async findOneByUser(id: string, userId: string): Promise<ConversationEntity> {
    const conv = await this.conversationRepo.findOne({
      where: { id, authorId: userId },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }
}
