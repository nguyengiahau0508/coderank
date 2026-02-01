import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity()
export class TokenEntity extends BaseEntity {
  @Column({ type: 'text' })
  key: string

  @Column('varchar', { length: 20 })
  type: string;

  @Column('boolean', { default: false })
  isRevoked: boolean;

  @Column('timestamp')
  expiresAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
}