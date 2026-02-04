import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ProblemsEntity } from './problems.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity("hints")
// Index này hỗ trợ việc lấy hint theo thứ tự cho một bài cụ thể
@Index("IDX_hints_prob_order", ["problemId", "hintOrder"], { unique: true })
export class HintsEntity extends BaseEntity {
  // Đồng bộ naming convention (camelCase cho TypeORM property, snake_case cho DB nếu muốn, ở đây giữ nguyên logic cũ của bạn)
  @Column({ type: "uuid" }) 
  problemId: string; 

  @ManyToOne(() => ProblemsEntity, (p) => p.hints, { onDelete: "CASCADE" })
  @JoinColumn({ name: "problemId" }) // Sửa lại name khớp với property problemId
  problem: ProblemsEntity;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "int", default: 0 })
  hintOrder: number;

  @Column({ type: "boolean", default: false })
  isPublic: boolean;

  @Column({ type: "uuid", nullable: true })
  authorId?: string;
}