import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CourseQuizzesEntity } from './course-quizzes.entity';
import { QuizQuestionTypeEnum } from 'src/common/enums/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('course_quiz_questions')
@Index('IDX_question_quiz', ['quizId'])
@Index('IDX_question_quiz_order', ['quizId', 'questionOrder'])
export class CourseQuizQuestionsEntity extends BaseEntity {
  @ApiProperty({ description: 'Quiz UUID' })
  @Column({ type: 'uuid' })
  quizId: string;

  @ApiProperty({
    description: 'Question text (supports Markdown)',
    example: 'Độ phức tạp thời gian của Binary Search là gì?',
  })
  @Column({ type: 'text' })
  questionText: string;

  @ApiProperty({ description: 'Question type', enum: QuizQuestionTypeEnum })
  @Column({
    type: 'enum',
    enum: QuizQuestionTypeEnum,
    default: QuizQuestionTypeEnum.MultipleChoice,
  })
  questionType: QuizQuestionTypeEnum;

  /**
   * Options stored as JSON array. Example for multiple choice:
   * [
   *   { "id": "A", "text": "O(n)", "isCorrect": false },
   *   { "id": "B", "text": "O(log n)", "isCorrect": true },
   *   { "id": "C", "text": "O(n²)", "isCorrect": false },
   *   { "id": "D", "text": "O(1)", "isCorrect": false }
   * ]
   */
  @ApiPropertyOptional({ description: 'Answer options as JSON array' })
  @Column({ type: 'json', nullable: true })
  options?: Record<string, any>[];

  @ApiProperty({
    description: 'Correct answer (for short answer / true-false)',
    example: 'O(log n)',
  })
  @Column({ type: 'text', nullable: true, select: false })
  correctAnswer?: string;

  @ApiPropertyOptional({ description: 'Explanation shown after answering' })
  @Column({ type: 'text', nullable: true, select: false })
  explanation?: string;

  @ApiProperty({ description: 'Points for this question', example: 10 })
  @Column({ type: 'smallint', default: 10, unsigned: true })
  points: number;

  @ApiProperty({ description: 'Display order within the quiz', example: 1 })
  @Column({ type: 'int', default: 0, unsigned: true })
  questionOrder: number;

  @ApiPropertyOptional({ description: 'Image URL for the question' })
  @Column({ type: 'longtext', nullable: true })
  imageUrl?: string;

  // ===== RELATIONS =====

  @ManyToOne(() => CourseQuizzesEntity, (q) => q.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quizId' })
  quiz: CourseQuizzesEntity;
}
