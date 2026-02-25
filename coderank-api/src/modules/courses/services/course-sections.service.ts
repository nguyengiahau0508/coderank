import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseSectionsEntity } from '../entities/course-sections.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseSectionsService extends BaseService<CourseSectionsEntity> {
  constructor(
    @InjectRepository(CourseSectionsEntity)
    protected readonly repository: Repository<CourseSectionsEntity>,
  ) {
    super(repository);
  }
}
