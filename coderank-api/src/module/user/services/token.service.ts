import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenEntity } from '../entities/token.entity';
import { BaseService } from 'src/common/services/base.service';
@Injectable()
export class TokenService extends BaseService<TokenEntity> {
  constructor(@InjectRepository(TokenEntity) private readonly tokenRepository: Repository<TokenEntity>) { 
    super(tokenRepository);
  }

  async revokeToken(key: string): Promise<boolean> {
    const tokenEntity = await this.findOne({ where: { key } })

    if (!tokenEntity) return false;

    if (tokenEntity.isRevoked == false) {
      const tokenToUpdate = await this.tokenRepository.preload({
        id: tokenEntity.id,
        isRevoked: true,
      });

      if (tokenToUpdate) {
        await this.tokenRepository.save(tokenToUpdate);
      }
    }

    return true
  }
}