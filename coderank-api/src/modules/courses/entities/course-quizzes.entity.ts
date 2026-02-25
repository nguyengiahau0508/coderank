import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CourseLessonsEntity } from './course-lessons.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseQuizQuestionsEntity } from './course-quiz-questions.entity';
import { CourseQuizAttemptsEntity } from './course-quiz-attempts.entity';

@Entity('course_quizzes')
@Index('IDX_quiz_lesson', ['lessonId'])
@Index('IDX_quiz_lesson_order', ['lessonId', 'quizOrder'])
export class CourseQuizzesEntity extends BaseEntity {
  @ApiProperty({ description: 'Lesson UUID' })
  @Column({ type: 'uuid' })
  lessonId: string;

  @ApiProperty({ description: 'Quiz title', example: 'Kiểm tra: Mảng một chiều' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({ description: 'Quiz description/instructions' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({ description: 'Time limit in minutes (null = unlimited)', example: 30 })
  @Column({ type: 'int', nullable: true, unsigned: true })
  timeLimitMinutes?: number;

  @ApiProperty({ description: 'Minimum passing score percentage (0-100)', example: 70 })
  @Column({ type: 'smallint', default: 70, unsigned: true })
  passingScore: number;

  @ApiProperty({ description: 'Maximum attempts allowed (0 = unlimited)', example: 3 })
  @Column({ type: 'smallint', default: 0, unsigned: true })
  maxAttempts: number;

  @ApiProperty({ description: 'Display order within the lesson', example: 1 })
  @Column({ type: 'int', default: 0, unsigned: true })
  quizOrder: number;

  @ApiProperty({ description: 'Whether to shuffle questions', example: false })
  @Column({ type: 'boolean', default: false })
  shuffleQuestions: boolean;

  @ApiProperty({ description: 'Whether to show correct answers after submission', example: true })
  @Column({ type: 'boolean', default: true })
  showCorrectAnswers: boolean;

  @ApiProperty({ description: 'Whether this quiz is published', example: false })
  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  // ===== RELATIONS =====

  @ManyToOne(() => CourseLessonsEntity, (l) => l.quizzes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: CourseLessonsEntity;

  @OneToMany(() => CourseQuizQuestionsEntity, (q) => q.quiz, { cascade: true })
  questions: CourseQuizQuestionsEntity[];

  @OneToMany(() => CourseQuizAttemptsEntity, (a) => a.quiz)
  attempts: CourseQuizAttemptsEntity[];
}
