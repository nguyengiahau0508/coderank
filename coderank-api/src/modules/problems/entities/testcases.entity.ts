import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, Index, ManyToOne, JoinColumn } from "typeorm"; // Thêm JoinColumn
import { ProblemsEntity } from "./problems.entity";
import { TestcaseCompareTypeEnum } from "src/common/enums/enums";
// ... decorators

@Entity("testcases")
// OPTIMIZATION: Composite Index quan trọng nhất.
// Query thường gặp: "Lấy tất cả testcase của bài X, sắp xếp theo thứ tự".
// Index này giúp DB không cần 'filesort' lại dữ liệu.
@Index("IDX_testcases_prob_order", ["problemId", "testcaseOrder"]) 
@Index("IDX_testcases_isSample", ["isSample"]) // Để lọc testcase mẫu hiển thị cho user
export class TestcasesEntity extends BaseEntity {
  @Column({ type: "uuid" })
  problemId: string;

  // OPTIMIZATION: select: false
  // Input/Output có thể lên tới vài MB. KHÔNG BAO GIỜ load mặc định.
  // Chỉ dùng queryBuilder.addSelect() khi chấm bài hoặc view chi tiết.
  @Column({ type: "longtext", select: false })
  input: string;

  @Column({ type: "longtext", select: false })
  output: string;

  @Column({ type: "boolean", default: false })
  isSample: boolean;

  @Column({ type: "boolean", default: true })
  isHidden: boolean;

  @Column({ type: "int", default: 0 })
  testcaseOrder: number;

  @Column({ type: "enum", enum: TestcaseCompareTypeEnum, default: TestcaseCompareTypeEnum.Exact })
  compareType: TestcaseCompareTypeEnum;

  @ManyToOne(() => ProblemsEntity, (p) => p.testcases, { onDelete: "CASCADE" })
  @JoinColumn({ name: "problemId" }) // Map chính xác với cột problemId ở trên
  problem: ProblemsEntity;
}