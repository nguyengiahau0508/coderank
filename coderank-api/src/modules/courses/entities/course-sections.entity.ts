import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CoursesEntity } from './courses.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLessonsEntity } from './course-lessons.entity';

@Entity('course_sections')
@Index('IDX_section_course_order', ['courseId', 'sectionOrder'])
@Index('IDX_section_course', ['courseId'])
export class CourseSectionsEntity extends BaseEntity {
  @ApiProperty({ description: 'Course UUID' })
  @Column({ type: 'uuid' })
  courseId: string;

  @ApiProperty({
    description: 'Section title',
    example: 'Chương 1: Mảng và Chuỗi',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({ description: 'Section description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Display order within the course', example: 1 })
  @Column({ type: 'int', default: 0, unsigned: true })
  sectionOrder: number;

  @ApiProperty({
    description: 'Whether this section is published',
    example: true,
  })
  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  // ===== RELATIONS =====

  @ManyToOne(() => CoursesEntity, (c) => c.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: CoursesEntity;

  @OneToMany(() => CourseLessonsEntity, (l) => l.section, { cascade: true })
  lessons: CourseLessonsEntity[];
}
