import { BaseEntity } from "src/common/entities/base.entity";
import {
  Column,
  Entity,
  Index,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UsersEntity } from "src/module/users/entities/user.entity";
import { TagsEntity } from "./tags.entity";
import { TestcasesEntity } from "./testcases.entity";
import { HintsEntity } from "./hints.entity";
import { DifficultyEnum } from "src/common/enums/enums";
// ... imports decorators

@Entity("problems")
@Index("IDX_problem_slug", ["slug"], { unique: true })
// Tối ưu query lọc bài tập theo trạng thái và độ khó (thường đi chung)
@Index("IDX_problem_publish_diff", ["isPublished", "difficulty"]) 
@Index("IDX_problem_author", ["authorId"])
export class ProblemsEntity extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug: string;

  // OPTIMIZATION: select: false
  // Khi get list problems, không cần load nội dung bài. Chỉ load khi get detail.
  @Column({ type: "text", nullable: true, select: false })
  description?: string;

  @Column({ type: "text", nullable: true, select: false })
  inputDescription?: string;

  @Column({ type: "text", nullable: true, select: false })
  outputDescription?: string;

  @Column({ type: "text", nullable: true, select: false })
  notes?: string;

  // Sử dụng unsigned int nếu không bao giờ âm để mở rộng range (tùy chọn)
  @Column({ type: "int", default: 1000, unsigned: true })
  timeLimitMs: number;

  @Column({ type: "int", default: 256, unsigned: true })
  memoryLimitMb: number;

  @Column({ type: "enum", enum: DifficultyEnum, default: DifficultyEnum.Medium })
  difficulty: DifficultyEnum;

  @Column({ type: "boolean", default: false })
  isPublished: boolean;

  // smallint đủ cho điểm số (max 32767), tiết kiệm hơn int
  @Column({ type: "smallint", default: 100, unsigned: true })
  points: number;

  @Column({ type: "uuid", nullable: true })
  authorId?: string;

  @ManyToOne(() => UsersEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "authorId" })
  author?: UsersEntity;

  @ManyToMany(() => TagsEntity, (t) => t.problems)
  @JoinTable({
    name: "problem_tags",
    joinColumn: { name: "problem_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags: TagsEntity[];

  @OneToMany(() => TestcasesEntity, (t) => t.problem, { cascade: true })
  testcases: TestcasesEntity[];

  @OneToMany(() => HintsEntity, (h) => h.problem, { cascade: true })
  hints: HintsEntity[];
}