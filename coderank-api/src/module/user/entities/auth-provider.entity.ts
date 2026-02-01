import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";
import { AuthProvidersEnum } from "src/common/enums/enums";

@Entity()
export class AuthProviderEntity extends BaseEntity{
  @Column({
    type: 'enum',
    enum: AuthProvidersEnum
  })
  provider: AuthProvidersEnum

  @Column({ nullable: true })
  providerId: string

  @Column({ nullable: true })
  passwordHash: string

  @OneToOne(() => UserEntity, (user) => user.authProviders, { onDelete: "CASCADE" })
  @JoinColumn()
  user: UserEntity;
}