import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CoursesEntity } from './courses.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { EnrollmentStatusEnum } from 'src/common/enums/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('course_enrollments')
@Index('IDX_enrollment_unique', ['courseId', 'userId'], { unique: true })
@Index('IDX_enrollment_course', ['courseId'])
@Index('IDX_enrollment_user', ['userId'])
@Index('IDX_enrollment_status', ['courseId', 'status'])
export class CourseEnrollmentsEntity extends BaseEntity {
  @ApiProperty({ description: 'Course UUID' })
  @Column({ type: 'uuid' })
  courseId: string;

  @ApiProperty({ description: 'User UUID' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Enrollment status', enum: EnrollmentStatusEnum })
  @Column({
    type: 'enum',
    enum: EnrollmentStatusEnum,
    default: EnrollmentStatusEnum.Active,
  })
  status: EnrollmentStatusEnum;

  @ApiPropertyOptional({ description: 'When the student enrolled' })
  @Column({ type: 'timestamp', nullable: true })
  enrolledAt?: Date;

  @ApiPropertyOptional({ description: 'When the student completed the course' })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'Overall progress percentage (0-100)', example: 0 })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercent: number;

  @ApiProperty({ description: 'Number of completed lessons', example: 0 })
  @Column({ type: 'int', default: 0, unsigned: true })
  completedLessons: number;

  @ApiProperty({ description: 'Total lessons in the course at enrollment', example: 0 })
  @Column({ type: 'int', default: 0, unsigned: true })
  totalLessons: number;

  @ApiPropertyOptional({ description: 'Last accessed timestamp' })
  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt?: Date;

  @ApiPropertyOptional({ description: 'Certificate issued date (if completed)' })
  @Column({ type: 'timestamp', nullable: true })
  certificateIssuedAt?: Date;

  // ===== RELATIONS =====

  @ManyToOne(() => CoursesEntity, (c) => c.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: CoursesEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
