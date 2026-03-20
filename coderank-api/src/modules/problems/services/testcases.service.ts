import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { TestcasesEntity } from '../entities/testcases.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TestcasesService extends BaseService<TestcasesEntity> {
  constructor(
    @InjectRepository(TestcasesEntity)
    protected readonly repository: Repository<TestcasesEntity>,
  ) {
    super(repository);
  }
}
