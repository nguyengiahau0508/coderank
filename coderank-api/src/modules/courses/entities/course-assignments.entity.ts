import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CourseLessonsEntity } from './course-lessons.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseAssignmentSubmissionsEntity } from './course-assignment-submissions.entity';

export enum AssignmentTypeEnum {
  FileUpload = 'file_upload',
  CodeSubmit = 'code_submit',
  Mixed = 'mixed',
}

@Entity('course_assignments')
@Index('IDX_assignment_lesson', ['lessonId'])
@Index('IDX_assignment_lesson_order', ['lessonId', 'assignmentOrder'])
export class CourseAssignmentsEntity extends BaseEntity {
  @ApiProperty({ description: 'Lesson UUID' })
  @Column({ type: 'uuid' })
  lessonId: string;

  @ApiProperty({
    description: 'Assignment title',
    example: 'Bài tập 1: Xử lý mảng',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({
    description: 'Assignment description/instructions (HTML)',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Assignment type', enum: AssignmentTypeEnum })
  @Column({
    type: 'enum',
    enum: AssignmentTypeEnum,
    default: AssignmentTypeEnum.FileUpload,
  })
  type: AssignmentTypeEnum;

  @ApiPropertyOptional({
    description: 'Attached requirement file - Google Drive file ID',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  attachmentFileId?: string;

  @ApiPropertyOptional({ description: 'Original name of the attached file' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  attachmentFileName?: string;

  @ApiPropertyOptional({ description: 'MIME type of the attached file' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  attachmentMimeType?: string;

  @ApiPropertyOptional({ description: 'Size of the attached file in bytes' })
  @Column({ type: 'bigint', nullable: true, unsigned: true })
  attachmentFileSize?: number;

  @ApiProperty({
    description: 'Maximum score for this assignment',
    example: 100,
  })
  @Column({ type: 'int', default: 100, unsigned: true })
  maxScore: number;

  @ApiPropertyOptional({ description: 'Due date for submission' })
  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @ApiProperty({ description: 'Display order within the lesson', example: 1 })
  @Column({ type: 'int', default: 0, unsigned: true })
  assignmentOrder: number;

  @ApiProperty({
    description: 'Whether this assignment is published',
    example: true,
  })
  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @ApiPropertyOptional({
    description: 'Allowed file extensions (comma-separated)',
    example: '.pdf,.docx,.zip,.py,.java,.cpp',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  allowedFileTypes?: string;

  @ApiPropertyOptional({ description: 'Maximum file size in MB', example: 10 })
  @Column({ type: 'int', nullable: true, unsigned: true })
  maxFileSizeMb?: number;

  // ===== RELATIONS =====

  @ManyToOne(() => CourseLessonsEntity, (l) => l.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lessonId' })
  lesson: CourseLessonsEntity;

  @OneToMany(() => CourseAssignmentSubmissionsEntity, (s) => s.assignment, {
    cascade: true,
  })
  submissions: CourseAssignmentSubmissionsEntity[];
}
