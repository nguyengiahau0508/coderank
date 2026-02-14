import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from
  'typeorm';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { ContestStatusEnum } from 'src/common/enums/enums';
import { ContestProblemsEntity } from './contest-problems.entity';
import { ContestParticipantsEntity } from './contest-participants.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('contests')
@Index('IDX_contest_slug', ['slug'], { unique: true })
@Index('IDX_contest_status_dates', ['status', 'startTime', 'endTime'])
@Index('IDX_contest_author', ['authorId'])
export class ContestsEntity extends BaseEntity {
  @ApiProperty({ description: 'Contest title', example: 'Weekly Contest #1' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'weekly-contest-1' })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @ApiPropertyOptional({ description: 'Contest description' })
  @Column({ type: 'text', nullable: true, select: false })
  description?: string;

  @ApiPropertyOptional({ description: 'Contest rules' })
  @Column({ type: 'text', nullable: true, select: false })
  rules?: string;

  @ApiProperty({ description: 'Contest start time', example: '2024-01-01T00:00:00Z' })
  @Column({ type: 'timestamp' })
  startTime: Date;

  @ApiProperty({ description: 'Contest end time', example: '2024-01-01T03:00:00Z' })
  @Column({ type: 'timestamp' })
  endTime: Date;

  @ApiPropertyOptional({ description: 'Contest duration in minutes', example: 180 })
  @Column({ type: 'int', nullable: true })
  durationMinutes?: number; // Thời gian thi (phút)

  @ApiProperty({ description: 'Contest status', enum: ContestStatusEnum, example: ContestStatusEnum.Draft })
  @Column({
    type: 'enum', enum: ContestStatusEnum, default:
      ContestStatusEnum.Draft
  })
  status: ContestStatusEnum; // Draft, Upcoming, Running, Ended

  @ApiProperty({ description: 'Whether contest is public', example: false })
  @Column({ type: 'boolean', default: false })
  isPublic: boolean; // Public/Private contest

  @ApiProperty({ description: 'Whether contest is rated', example: false })
  @Column({ type: 'boolean', default: false })
  isRated: boolean; // Có tính rating không

  @ApiPropertyOptional({ description: 'Maximum participants (0 for unlimited)', example: 0 })
  @Column({ type: 'int', default: 0, unsigned: true })
  maxParticipants?: number; // Giới hạn số người tham gia

  @ApiPropertyOptional({ description: 'Password for private contest' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  password?: string; // Password cho contest private

  @ApiPropertyOptional({ description: 'Contest author' })
  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author?: UsersEntity;

  @ApiPropertyOptional({ description: 'Contest problems', type: () => [ContestProblemsEntity] })
  @OneToMany(() => ContestProblemsEntity, (cp) => cp.contest, {
    cascade:
      true
  })
  contestProblems: ContestProblemsEntity[];

  @ApiPropertyOptional({ description: 'Contest participants', type: () => [ContestParticipantsEntity] })
  @OneToMany(() => ContestParticipantsEntity, (cp) => cp.contest, {
    cascade: true
  })
  participants: ContestParticipantsEntity[];
}
