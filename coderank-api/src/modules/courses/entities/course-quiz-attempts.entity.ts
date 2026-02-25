import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CourseQuizzesEntity } from './course-quizzes.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('course_quiz_attempts')
@Index('IDX_attempt_quiz_user', ['quizId', 'userId'])
@Index('IDX_attempt_user', ['userId'])
@Index('IDX_attempt_quiz', ['quizId'])
export class CourseQuizAttemptsEntity extends BaseEntity {
  @ApiProperty({ description: 'Quiz UUID' })
  @Column({ type: 'uuid' })
  quizId: string;

  @ApiProperty({ description: 'User UUID' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Score achieved (percentage 0-100)', example: 85 })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  score: number;

  @ApiProperty({ description: 'Total points earned', example: 80 })
  @Column({ type: 'int', default: 0, unsigned: true })
  pointsEarned: number;

  @ApiProperty({ description: 'Total possible points', example: 100 })
  @Column({ type: 'int', default: 0, unsigned: true })
  totalPoints: number;

  @ApiProperty({ description: 'Whether this attempt passed', example: true })
  @Column({ type: 'boolean', default: false })
  isPassed: boolean;

  @ApiProperty({ description: 'When the attempt started' })
  @Column({ type: 'timestamp' })
  startedAt: Date;

  @ApiPropertyOptional({ description: 'When the attempt was submitted' })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Time taken in seconds' })
  @Column({ type: 'int', nullable: true, unsigned: true })
  timeTakenSeconds?: number;

  /**
   * Student answers stored as JSON. Example:
   * [
   *   { "questionId": "uuid", "selectedOptionId": "B", "isCorrect": true },
   *   { "questionId": "uuid", "answer": "O(log n)", "isCorrect": true }
   * ]
   */
  @ApiPropertyOptional({ description: 'Student answers as JSON' })
  @Column({ type: 'json', nullable: true })
  answers?: Record<string, any>[];

  @ApiProperty({ description: 'Attempt number (1st, 2nd, etc.)', example: 1 })
  @Column({ type: 'smallint', default: 1, unsigned: true })
  attemptNumber: number;

  // ===== RELATIONS =====

  @ManyToOne(() => CourseQuizzesEntity, (q) => q.attempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizId' })
  quiz: CourseQuizzesEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
