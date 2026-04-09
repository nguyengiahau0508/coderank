import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UsersEntity } from 'src/modules/users/entities/user.entity';

/**
 * Learning path step definition.
 */
interface LearningStep {
  order: number;
  title: string;
  description: string;
  type: 'topic' | 'problem' | 'quiz' | 'project';
  resourceId?: string; // Problem ID, course ID, etc.
  estimatedTime?: number; // in minutes
  isCompleted: boolean;
  completedAt?: string;
}

/**
 * Entity storing personalized learning paths.
 */
@Entity('learning_paths')
@Index('IDX_learning_path_user', ['userId'])
@Index('IDX_learning_path_status', ['status'])
export class LearningPathsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Goal topic or skill
  @Column({ type: 'varchar', length: 100 })
  goalTopic: string;

  @Column({ type: 'varchar', length: 20, default: 'beginner' })
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  // Learning steps
  @Column({ type: 'json' })
  steps: LearningStep[];

  @Column({ type: 'int', default: 0 })
  currentStepIndex: number;

  @Column({ type: 'int', default: 0 })
  completedSteps: number;

  @Column({ type: 'int', default: 0 })
  totalSteps: number;

  // Progress percentage
  @Column({ type: 'float', default: 0 })
  progressPercent: number;

  // Status
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'draft' | 'active' | 'paused' | 'completed' | 'abandoned';

  // Time tracking
  @Column({ type: 'int', nullable: true })
  estimatedTotalMinutes?: number;

  @Column({ type: 'int', default: 0 })
  actualMinutesSpent: number;

  // Generation metadata
  @Column({ type: 'varchar', length: 50, nullable: true })
  generatedBy?: string; // AI provider

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
