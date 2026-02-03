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
}