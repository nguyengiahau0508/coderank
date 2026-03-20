import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CourseLessonsEntity } from './course-lessons.entity';
import { ProblemsEntity } from 'src/modules/problems/entities/problems.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('course_lesson_problems')
@Index('IDX_lesson_problem_unique', ['lessonId', 'problemId'], { unique: true })
@Index('IDX_lesson_problem_lesson', ['lessonId'])
@Index('IDX_lesson_problem_problem', ['problemId'])
export class CourseLessonProblemsEntity extends BaseEntity {
  @ApiProperty({ description: 'Lesson UUID' })
  @Column({ type: 'uuid' })
  lessonId: string;

  @ApiProperty({ description: 'Problem UUID' })
  @Column({ type: 'uuid' })
  problemId: string;

  @ApiProperty({ description: 'Display order within the lesson', example: 1 })
  @Column({ type: 'int', default: 0, unsigned: true })
  problemOrder: number;

  @ApiProperty({
    description: 'Whether this problem is required to complete the lesson',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @ApiPropertyOptional({
    description: 'Custom label for the problem in this lesson',
    example: 'Bài tập 1',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  label?: string;

  // ===== RELATIONS =====

  @ManyToOne(() => CourseLessonsEntity, (l) => l.problems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lessonId' })
  lesson: CourseLessonsEntity;

  @ManyToOne(() => ProblemsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: ProblemsEntity;
}
