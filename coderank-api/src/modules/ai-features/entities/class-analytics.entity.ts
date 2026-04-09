import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { CoursesEntity } from 'src/modules/courses/entities/courses.entity';

/**
 * Entity for storing class/course analytics.
 */
@Entity('class_analytics')
@Index('IDX_class_analytics_course', ['courseId'])
@Index('IDX_class_analytics_period', ['periodStart', 'periodEnd'])
export class ClassAnalyticsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  courseId: string;

  @Column({ type: 'uuid', nullable: true })
  instructorId?: string;

  // Period for this analytics snapshot
  @Column({ type: 'timestamp' })
  periodStart: Date;

  @Column({ type: 'timestamp' })
  periodEnd: Date;

  // Student metrics
  @Column({ type: 'int', default: 0 })
  totalStudents: number;

  @Column({ type: 'int', default: 0 })
  activeStudents: number; // Students with at least one submission

  @Column({ type: 'float', default: 0 })
  averageProgress: number; // 0-100%

  // Submission metrics
  @Column({ type: 'int', default: 0 })
  totalSubmissions: number;

  @Column({ type: 'int', default: 0 })
  acceptedSubmissions: number;

  @Column({ type: 'float', default: 0 })
  overallAcceptanceRate: number;

  @Column({ type: 'float', default: 0 })
  averageAttemptsPerProblem: number;

  // Problem metrics
  @Column({ type: 'int', default: 0 })
  totalProblemsAssigned: number;

  @Column({ type: 'int', default: 0 })
  problemsWithZeroSolves: number;

  // Difficulty distribution
  @Column({ type: 'json', nullable: true })
  difficultyBreakdown?: {
    easy: { assigned: number; avgAcceptance: number };
    medium: { assigned: number; avgAcceptance: number };
    hard: { assigned: number; avgAcceptance: number };
  };

  // Topic analysis
  @Column({ type: 'json', nullable: true })
  topicPerformance?: Record<
    string,
    {
      totalProblems: number;
      averageAcceptance: number;
      averageAttempts: number;
    }
  >;

  // Common mistakes identified by AI
  @Column({ type: 'json', nullable: true })
  commonMistakes?: {
    category: string;
    description: string;
    frequency: number;
    affectedStudents: number;
  }[];

  // AI-generated insights
  @Column({ type: 'json', nullable: true })
  aiInsights?: {
    summary: string;
    summaryVi: string;
    recommendations: string[];
    recommendationsVi: string[];
    alerts: string[];
    alertsVi: string[];
  };

  // Top struggling topics
  @Column({ type: 'json', nullable: true })
  strugglingTopics?: string[];

  // Generated timestamp
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generatedAt: Date;

  @ManyToOne(() => CoursesEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: CoursesEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'instructorId' })
  instructor?: UsersEntity;
}
