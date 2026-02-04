import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, Index, ManyToMany } from "typeorm";
import { ProblemsEntity } from "./problems.entity";
// ... decorators

@Entity("tags")
@Index("IDX_tags_slug", ["slug"], { unique: true })
export class TagsEntity extends BaseEntity {
  // Giảm length xuống nếu tag không quá dài để tối ưu index
  @Column({ type: "varchar", length: 50 }) 
  name: string;

  @Column({ type: "varchar", length: 50 })
  slug: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  @ManyToMany(() => ProblemsEntity, (p) => p.tags)
  problems: ProblemsEntity[];
}