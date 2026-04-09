import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, OneToOne, JoinColumn } from 'typeorm';
import { UsersEntity } from 'src/modules/users/entities/user.entity';

/**
 * Entity storing user skill profile for personalized recommendations.
 */
@Entity('user_skill_profiles')
@Index('IDX_skill_profile_user', ['userId'], { unique: true })
export class UserSkillProfilesEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  // Skill levels by topic (stored as JSON)
  @Column({ type: 'json', nullable: true })
  topicSkills?: Record<
    string,
    {
      level: number; // 0-100
      problemsSolved: number;
      averageAttempts: number;
      lastPracticed?: string;
    }
  >;

  // Strengths - topics where user excels
  @Column({ type: 'json', nullable: true })
  strengths?: string[];

  // Weaknesses - topics that need improvement
  @Column({ type: 'json', nullable: true })
  weaknesses?: string[];

  // Overall metrics
  @Column({ type: 'int', default: 0 })
  totalProblemsSolved: number;

  @Column({ type: 'int', default: 0 })
  totalSubmissions: number;

  @Column({ type: 'float', default: 0 })
  averageAccuracy: number; // Percentage of accepted submissions

  @Column({ type: 'float', default: 0 })
  averageAttemptsPerProblem: number;

  // Difficulty distribution
  @Column({ type: 'int', default: 0 })
  easySolved: number;

  @Column({ type: 'int', default: 0 })
  mediumSolved: number;

  @Column({ type: 'int', default: 0 })
  hardSolved: number;

  // Learning pace indicators
  @Column({ type: 'varchar', length: 20, default: 'moderate' })
  learningPace: 'slow' | 'moderate' | 'fast';

  @Column({ type: 'varchar', length: 50, nullable: true })
  preferredDifficulty?: string;

  // Code quality metrics
  @Column({ type: 'float', nullable: true })
  averageCodeQuality?: number;

  @Column({ type: 'float', nullable: true })
  averageTimeComplexityScore?: number;

  // Last analysis timestamp
  @Column({ type: 'timestamp', nullable: true })
  lastAnalyzedAt?: Date;

  @OneToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
