import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CoursesEntity } from './courses.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('course_reviews')
@Index('IDX_review_unique', ['courseId', 'userId'], { unique: true })
@Index('IDX_review_course', ['courseId'])
@Index('IDX_review_user', ['userId'])
@Index('IDX_review_rating', ['courseId', 'rating'])
export class CourseReviewsEntity extends BaseEntity {
  @ApiProperty({ description: 'Course UUID' })
  @Column({ type: 'uuid' })
  courseId: string;

  @ApiProperty({ description: 'User UUID' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Rating (1-5 stars)', example: 5 })
  @Column({ type: 'smallint', unsigned: true })
  rating: number; // 1-5

  @ApiPropertyOptional({ description: 'Review comment' })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ApiProperty({ description: 'Whether the review is visible', example: true })
  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  // ===== RELATIONS =====

  @ManyToOne(() => CoursesEntity, (c) => c.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: CoursesEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
