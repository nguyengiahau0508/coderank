import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CoursesEntity } from '../entities/courses.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';

@Injectable()
export class CoursesService extends BaseService<CoursesEntity> {
  constructor(
    @InjectRepository(CoursesEntity)
    protected readonly repository: Repository<CoursesEntity>,
  ) {
    super(repository);
  }
}
