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
import {
  ApiStringProperty,
  ApiStringOptional,
  ApiBooleanProperty,
  ApiIntProperty,
  ApiEnumProperty,
  ApiRelationArrayOptional,
  ApiRelationOptional,
  ApiUserIdProperty,
} from "src/common/decorators";
import { DifficultyEnum } from "src/common/enums/enums";

/**
 * Problems Entity
 * Stores problem metadata and relations to tags/testcases
 */
@Entity("problems")
@Index("IDX_problems_slug", ["slug"], { unique: true })
@Index("IDX_problems_difficulty", ["difficulty"])
@Index("IDX_problems_isPublished", ["isPublished"])
export class ProblemsEntity extends BaseEntity {
  @ApiStringProperty("Problem title", "Sum of Two", 255)
  @Column({ type: "varchar", length: 255 })
  title: string;

  @ApiStringProperty("URL-friendly slug", "sum-of-two", 255)
  @Column({ type: "varchar", length: 255 })
  slug: string;

  @ApiStringOptional("Full problem statement (markdown/HTML)", "Given two integers...")
  @Column({ type: "longtext", nullable: true })
  description: string;

  @ApiStringOptional("Input description", "First line contains...")
  @Column({ type: "longtext", nullable: true })
  inputDescription: string;

  @ApiStringOptional("Output description", "Print the sum of two integers")
  @Column({ type: "longtext", nullable: true })
  outputDescription: string;

  @ApiStringOptional("Sample input example", "1 9")
  @Column({ type: "longtext", nullable: true })
  sampleInput: string;

  @ApiStringOptional("Sample output example", "10")
  @Column({ type: "longtext", nullable: true })
  sampleOutput: string;

  @ApiIntProperty("Time limit (ms)", 1000, 0)
  @Column({ type: "int", default: 1000 })
  timeLimit: number;

  @ApiIntProperty("Memory limit (MB)", 256, 0)
  @Column({ type: "int", default: 256 })
  memoryLimit: number;

  @ApiEnumProperty("Problem difficulty", DifficultyEnum, "DifficultyEnum", DifficultyEnum.Medium, DifficultyEnum.Medium)
  @Column({ type: "enum", enum: DifficultyEnum, default: DifficultyEnum.Medium })
  difficulty: DifficultyEnum;

  @ApiBooleanProperty("Whether the problem is published (visible to users)", false)
  @Column({ type: "boolean", default: false })
  isPublished: boolean;

  @ApiIntProperty("Points awarded for full solve", 100, 0)
  @Column({ type: "int", default: 100 })
  points: number;

  @ApiUserIdProperty()
  @Column({ type: "uuid", nullable: true })
  authorId: string;

  @ApiRelationOptional("Author of the problem", () => UsersEntity)
  @ManyToOne(() => UsersEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "authorId" })
  author: UsersEntity;

  @ApiRelationArrayOptional("Associated tags", () => [TagsEntity])
  @ManyToMany(() => TagsEntity, (tag) => tag.problems, { cascade: true })
  @JoinTable({ name: "problem_tags" })
  tags: TagsEntity[];

  @ApiRelationArrayOptional("Test cases for judging and samples", () => [TestcasesEntity])
  @OneToMany(() => TestcasesEntity, (t) => t.problem, { cascade: ["insert", "update", "remove"] })
  testcases: TestcasesEntity[];
}
