import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAiConfigEntity } from './entities/user-ai-config.entity';
import { UpsertAiConfigDto } from './dto/upsert-ai-config.dto';

@Injectable()
export class UserAiConfigService {
  constructor(
    @InjectRepository(UserAiConfigEntity)
    private readonly repo: Repository<UserAiConfigEntity>,
  ) {}

  async findByUserId(userId: string): Promise<UserAiConfigEntity | null> {
    return this.repo.findOne({
      where: { authorId: userId },
    });
  }

  async findByUserIdWithApiKey(userId: string): Promise<UserAiConfigEntity | null> {
    return this.repo
      .createQueryBuilder('config')
      .addSelect('config.apiKey')
      .where('config.authorId = :userId', { userId })
      .getOne();
  }

  async upsert(userId: string, dto: UpsertAiConfigDto): Promise<UserAiConfigEntity> {
    const existing = await this.findByUserId(userId);

    if (existing) {
      Object.assign(existing, dto);
      return this.repo.save(existing);
    }

    const config = this.repo.create({
      ...dto,
      authorId: userId,
    });
    return this.repo.save(config);
  }

  async remove(userId: string): Promise<void> {
    await this.repo.delete({ authorId: userId });
  }
}
