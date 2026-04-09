import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CoursesEntity } from '../entities/courses.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CoursesService extends BaseService<CoursesEntity> {
  constructor(
    @InjectRepository(CoursesEntity)
    protected readonly repository: Repository<CoursesEntity>,
  ) {
    super(repository);
  }

  async create(data: Partial<CoursesEntity>): Promise<CoursesEntity> {
    if (!data.slug && data.title) {
      data.slug = await this.generateUniqueSlug(data.title);
    }
    return super.create(data);
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;

    while (await this.repository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-') // Replace multiple - with single -
      .replace(/^-|-$/g, '') // Trim - from start/end
      .substring(0, 200); // Limit length
  }
}
