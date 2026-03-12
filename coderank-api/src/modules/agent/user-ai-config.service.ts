import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAiConfigEntity } from './entities/user-ai-config.entity';
import { UpsertAiConfigDto } from './dto/upsert-ai-config.dto';
import { AiProviderEnum } from 'src/common/enums/enums';

@Injectable()
export class UserAiConfigService {
  constructor(
    @InjectRepository(UserAiConfigEntity)
    private readonly repo: Repository<UserAiConfigEntity>,
  ) {}

  async findAllByUserId(userId: string): Promise<UserAiConfigEntity[]> {
    return this.repo.find({ where: { authorId: userId } });
  }

  async findByUserIdAndProvider(
    userId: string,
    provider: AiProviderEnum,
  ): Promise<UserAiConfigEntity | null> {
    return this.repo.findOne({ where: { authorId: userId, provider } });
  }

  async findByUserIdAndProviderWithApiKey(
    userId: string,
    provider: AiProviderEnum,
  ): Promise<UserAiConfigEntity | null> {
    return this.repo
      .createQueryBuilder('config')
      .addSelect('config.apiKey')
      .where('config.authorId = :userId', { userId })
      .andWhere('config.provider = :provider', { provider })
      .getOne();
  }

  async upsert(userId: string, dto: UpsertAiConfigDto): Promise<UserAiConfigEntity> {
    const existing = await this.findByUserIdAndProvider(userId, dto.provider);

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

  async removeByProvider(userId: string, provider: AiProviderEnum): Promise<void> {
    await this.repo.delete({ authorId: userId, provider });
  }
}
