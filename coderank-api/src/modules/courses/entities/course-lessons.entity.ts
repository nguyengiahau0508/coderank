import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CourseSectionsEntity } from './course-sections.entity';
import { LessonTypeEnum } from 'src/common/enums/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLessonProgressEntity } from './course-lesson-progress.entity';
import { CourseQuizzesEntity } from './course-quizzes.entity';
import { CourseLessonProblemsEntity } from './course-lesson-problems.entity';
import { CourseAssignmentsEntity } from './course-assignments.entity';

@Entity('course_lessons')
@Index('IDX_lesson_section_order', ['sectionId', 'lessonOrder'])
@Index('IDX_lesson_section', ['sectionId'])
@Index('IDX_lesson_type', ['type'])
export class CourseLessonsEntity extends BaseEntity {
  @ApiProperty({ description: 'Section UUID' })
  @Column({ type: 'uuid' })
  sectionId: string;

  @ApiProperty({ description: 'Lesson title', example: 'Bài 1: Mảng một chiều' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({ description: 'Lesson content in Markdown' })
  @Column({ type: 'text', nullable: true, select: false })
  content?: string;

  @ApiProperty({ description: 'Lesson type', enum: LessonTypeEnum })
  @Column({
    type: 'enum',
    enum: LessonTypeEnum,
    default: LessonTypeEnum.Text,
  })
  type: LessonTypeEnum;

  @ApiPropertyOptional({ description: 'Video URL (for video lessons)' })
  @Column({ type: 'longtext', nullable: true })
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  @Column({ type: 'int', nullable: true, unsigned: true })
  videoDurationSeconds?: number;

  @ApiProperty({ description: 'Display order within section', example: 1 })
  @Column({ type: 'int', default: 0, unsigned: true })
  lessonOrder: number;

  @ApiPropertyOptional({ description: 'Estimated reading/completion time in minutes', example: 15 })
  @Column({ type: 'int', nullable: true, unsigned: true })
  estimatedMinutes?: number;

  @ApiProperty({ description: 'Whether this lesson is published', example: true })
  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @ApiProperty({ description: 'Whether this lesson is free to preview', example: false })
  @Column({ type: 'boolean', default: false })
  isFreePreview: boolean;

  // ===== RELATIONS =====

  @ManyToOne(() => CourseSectionsEntity, (s) => s.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sectionId' })
  section: CourseSectionsEntity;

  @OneToMany(() => CourseLessonProgressEntity, (p) => p.lesson)
  progress: CourseLessonProgressEntity[];

  @OneToMany(() => CourseQuizzesEntity, (q) => q.lesson, { cascade: true })
  quizzes: CourseQuizzesEntity[];

  @OneToMany(() => CourseLessonProblemsEntity, (p) => p.lesson, { cascade: true })
  problems: CourseLessonProblemsEntity[];

  @OneToMany(() => CourseAssignmentsEntity, (a) => a.lesson, { cascade: true })
  assignments: CourseAssignmentsEntity[];
}
