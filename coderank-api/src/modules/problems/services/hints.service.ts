import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { HintsEntity } from '../entities/hints.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class HintsService extends BaseService<HintsEntity> {
  constructor(
    @InjectRepository(HintsEntity)
    protected readonly repository: Repository<HintsEntity>,
  ) {
    super(repository);
  }
}
