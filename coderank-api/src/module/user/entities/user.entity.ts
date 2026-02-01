import { BaseEntity } from "src/common/entities/base.entity";
import { GenderEnum, RoleEnum } from "src/common/enums/enums";
import { Column, Entity, BeforeInsert, AfterInsert, OneToMany } from "typeorm";
import { TokenEntity } from "./token.entity";
import { Auth } from "googleapis";
import { AuthProviderEntity } from "./auth-provider.entity";


@Entity("users")
export class UserEntity extends BaseEntity {
    @Column()
    username: string

    @Column()
    name: string;

    @Column({ select: false })
    email: string;

    @Column({ type: 'text' })
    avatar: string

    @Column({ nullable: true })
    phoneNumber: string

    @Column({ nullable: true })
    address: string

    @Column({ nullable: true })
    birthday: Date

    @Column({
        type: 'enum',
        enum: GenderEnum,
        default: GenderEnum.Other
    })
    gender: GenderEnum

    @Column({
        type: 'enum',
        enum: RoleEnum,
        default: RoleEnum.Student,
    })
    role: RoleEnum

    @Column({
        default: 0
    })
    ratting: number

    @OneToMany(() => TokenEntity, (token) => token.user)
    tokens: TokenEntity[];

    @OneToMany(()=>AuthProviderEntity, (authProvider)=>authProvider.user)
    authProviders: AuthProviderEntity[];
}