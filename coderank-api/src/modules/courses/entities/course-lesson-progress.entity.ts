import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CourseLessonsEntity } from './course-lessons.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('course_lesson_progress')
@Index('IDX_progress_unique', ['lessonId', 'userId'], { unique: true })
@Index('IDX_progress_user', ['userId'])
@Index('IDX_progress_lesson', ['lessonId'])
export class CourseLessonProgressEntity extends BaseEntity {
  @ApiProperty({ description: 'Lesson UUID' })
  @Column({ type: 'uuid' })
  lessonId: string;

  @ApiProperty({ description: 'User UUID' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({
    description: 'Whether the lesson is completed',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @ApiPropertyOptional({ description: 'When the lesson was completed' })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Last time the user accessed this lesson',
  })
  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt?: Date;

  @ApiPropertyOptional({ description: 'Time spent on this lesson in seconds' })
  @Column({ type: 'int', default: 0, unsigned: true })
  timeSpentSeconds: number;

  @ApiPropertyOptional({ description: 'Notes/bookmarks by the student' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // ===== RELATIONS =====

  @ManyToOne(() => CourseLessonsEntity, (l) => l.progress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lessonId' })
  lesson: CourseLessonsEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
