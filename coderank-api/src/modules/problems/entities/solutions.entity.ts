import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ProblemsEntity } from './problems.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProgrammingLanguageEnum } from 'src/common/enums/enums';

@Entity('solutions')
@Index('IDX_solution_problem', ['problemId'])
@Index('IDX_solution_author', ['authorId'])
// Mỗi user chỉ được chia sẻ 1 solution cho mỗi bài theo mỗi ngôn ngữ
@Index('IDX_solution_unique_author_problem_lang', ['authorId', 'problemId', 'language'], { unique: true })
export class SolutionsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  problemId: string;

  @ManyToOne(() => ProblemsEntity, (p) => p.solutions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: ProblemsEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author?: UsersEntity;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  code: string;

  @Column({
    type: 'enum',
    enum: ProgrammingLanguageEnum,
    default: ProgrammingLanguageEnum.Python,
  })
  language: ProgrammingLanguageEnum;

  @Column({ type: 'int', default: 0, unsigned: true })
  upvotes: number;

  @Column({ type: 'int', default: 0, unsigned: true })
  downvotes: number;
}
