import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { ProblemsEntity } from "./problems.entity";
import {
  ApiStringOptional,
  ApiBooleanProperty,
  ApiIntProperty,
  ApiUserIdProperty,
  ApiRelationOptional,
} from "src/common/decorators";

export enum TestcaseCompareType {
  Exact = "exact",
  TrimWhitespace = "trim_whitespace",
  Tokenize = "tokenize",
}

/**
 * Testcase entity
 * Stores individual input/output pairs used for judging and samples
 */
@Entity("testcases")
@Index("IDX_testcases_problemId", ["problemId"])
@Index("IDX_testcases_isSample", ["isSample"])
export class TestcasesEntity extends BaseEntity {
  @ApiUserIdProperty()
  @Column({ type: "uuid" })
  problemId: string;

  @ApiStringOptional("Input content for testcase", "")
  @Column({ type: "longtext" })
  input: string;

  @ApiStringOptional("Expected output for testcase", "")
  @Column({ type: "longtext" })
  output: string;

  @ApiBooleanProperty("Whether this testcase is shown as sample", false)
  @Column({ type: "boolean", default: false })
  isSample: boolean;

  @ApiBooleanProperty("Whether this testcase is hidden from users (used only for judging)", true)
  @Column({ type: "boolean", default: true })
  isHidden: boolean;

  @ApiIntProperty("Order index of testcase", 0, 0)
  @Column({ type: "int", default: 0 })
  order: number;

  @ApiStringOptional("Compare type used to validate output (exact/trim/tokenize)", "exact")
  @Column({ type: "enum", enum: TestcaseCompareType, default: TestcaseCompareType.Exact })
  compareType: TestcaseCompareType;

  @ApiRelationOptional("Problem this testcase belongs to", () => ProblemsEntity)
  @ManyToOne(() => ProblemsEntity, (p) => p.testcases, { onDelete: "CASCADE" })
  problem: ProblemsEntity;
}
