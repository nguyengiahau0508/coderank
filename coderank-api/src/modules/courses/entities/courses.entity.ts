import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import {
  CourseLevelEnum,
  CourseStatusEnum,
} from 'src/common/enums/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseSectionsEntity } from './course-sections.entity';
import { CourseEnrollmentsEntity } from './course-enrollments.entity';
import { CourseReviewsEntity } from './course-reviews.entity';

@Entity('courses')
@Index('IDX_course_slug', ['slug'], { unique: true })
@Index('IDX_course_status_level', ['status', 'level'])
@Index('IDX_course_author', ['authorId'])
@Index('IDX_course_published', ['status', 'isPublic'])
export class CoursesEntity extends BaseEntity {
  @ApiProperty({ description: 'Course title', example: 'Cấu trúc dữ liệu và Giải thuật' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'cau-truc-du-lieu-va-giai-thuat' })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @ApiPropertyOptional({ description: 'Short summary of the course' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  summary?: string;

  @ApiPropertyOptional({ description: 'Full course description (Markdown)' })
  @Column({ type: 'text', nullable: true, select: false })
  description?: string;

  @ApiPropertyOptional({ description: 'Thumbnail image URL' })
  @Column({ type: 'longtext', nullable: true })
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Course difficulty level', enum: CourseLevelEnum })
  @Column({
    type: 'enum',
    enum: CourseLevelEnum,
    default: CourseLevelEnum.Beginner,
  })
  level: CourseLevelEnum;

  @ApiProperty({ description: 'Course publication status', enum: CourseStatusEnum })
  @Column({
    type: 'enum',
    enum: CourseStatusEnum,
    default: CourseStatusEnum.Draft,
  })
  status: CourseStatusEnum;

  @ApiProperty({ description: 'Whether course is publicly accessible', example: true })
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @ApiPropertyOptional({ description: 'Password for private courses' })
  @Column({ type: 'varchar', length: 100, nullable: true, select: false })
  password?: string;

  @ApiPropertyOptional({ description: 'Maximum number of students (0 = unlimited)', example: 0 })
  @Column({ type: 'int', default: 0, unsigned: true })
  maxStudents: number;

  @ApiPropertyOptional({ description: 'Estimated total duration in minutes', example: 600 })
  @Column({ type: 'int', nullable: true, unsigned: true })
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({ description: 'Comma-separated tags', example: 'algorithm,data-structure,graph' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  tags?: string;

  @ApiPropertyOptional({ description: 'Course category', example: 'Data Structures' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @ApiPropertyOptional({ description: 'What students will learn (JSON array)', example: '["Hiểu về cấu trúc dữ liệu","Giải thuật cơ bản"]' })
  @Column({ type: 'text', nullable: true, select: false })
  learningObjectives?: string; // JSON array of strings

  @ApiPropertyOptional({ description: 'Prerequisites (JSON array)', example: '["Lập trình cơ bản","Toán rời rạc"]' })
  @Column({ type: 'text', nullable: true, select: false })
  prerequisites?: string; // JSON array of strings

  @ApiProperty({ description: 'Total enrolled students count', example: 0 })
  @Column({ type: 'int', default: 0, unsigned: true })
  enrollmentCount: number;

  @ApiProperty({ description: 'Average rating (1-5)', example: 0 })
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @ApiProperty({ description: 'Total number of reviews', example: 0 })
  @Column({ type: 'int', default: 0, unsigned: true })
  reviewCount: number;

  // ===== RELATIONS =====

  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author?: UsersEntity;

  @OneToMany(() => CourseSectionsEntity, (s) => s.course, { cascade: true })
  sections: CourseSectionsEntity[];

  @OneToMany(() => CourseEnrollmentsEntity, (e) => e.course)
  enrollments: CourseEnrollmentsEntity[];

  @OneToMany(() => CourseReviewsEntity, (r) => r.course)
  reviews: CourseReviewsEntity[];
}
