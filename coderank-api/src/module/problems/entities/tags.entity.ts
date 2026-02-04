import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, Index, ManyToMany } from "typeorm";
import { ProblemsEntity } from "./problems.entity";
import { ApiStringProperty, ApiStringOptional, ApiRelationArrayOptional } from "src/common/decorators";

/** Tag Entity
 * Represents a tag/category for problems (e.g., dp, graph)
 */
@Entity("tags")
@Index("IDX_tags_name", ["name"], { unique: true })
@Index("IDX_tags_slug", ["slug"], { unique: true })
export class TagsEntity extends BaseEntity {
  @ApiStringProperty("Tag name", "dynamic-programming", 100)
  @Column({ type: "varchar", length: 100 })
  name: string;

  @ApiStringProperty("URL-friendly slug", "dp", 100)
  @Column({ type: "varchar", length: 100 })
  slug: string;

  @ApiStringOptional("Short tag description", "Problems related to dynamic programming")
  @Column({ type: "varchar", length: 255, nullable: true })
  description: string;

  @ApiRelationArrayOptional("Problems tagged with this tag", () => [ProblemsEntity])
  @ManyToMany(() => ProblemsEntity, (p) => p.tags)
  problems: ProblemsEntity[];
}
