import { BaseEntity } from "src/common/entities/base.entity";
import { GenderEnum, RoleEnum } from "src/common/enums/enums";
import { Column, Entity, OneToMany, Index, BeforeUpdate } from "typeorm";
import { TokenEntity } from "./token.entity";
import { AuthProviderEntity } from "./auth-provider.entity";
import { SessionEntity } from "./session.entity";

@Entity("users")
@Index(["role"])
@Index(["createdAt"])
export class UserEntity extends BaseEntity {
    @Column({ type: "varchar", length: 50, unique: true })
    username: string;

    @Column({ type: "varchar", length: 255 })
    fullName: string;

    @Column({ type: "varchar", length: 255, unique: true, select: false })
    email: string;

    @Column({ type: "longtext", nullable: true })
    avatarUrl: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    phoneNumber: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    address: string;

    @Column({ type: "date", nullable: true })
    birthday: Date;

    @Column({
        type: "enum",
        enum: GenderEnum,
        default: GenderEnum.Other
    })
    gender: GenderEnum;

    @Column({
        type: "enum",
        enum: RoleEnum,
        default: RoleEnum.Student
    })
    role: RoleEnum;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    rating: number;

    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @Column({ type: "boolean", default: false })
    isEmailVerified: boolean;

    @Column({ type: "timestamp", nullable: true })
    lastLoginAt: Date;

    @Column({ type: "int", default: 0 })
    loginAttempts: number;

    @Column({ type: "timestamp", nullable: true })
    lockedUntil: Date;

    @OneToMany(() => TokenEntity, (token) => token.user)
    tokens: TokenEntity[];

    @OneToMany(()=>AuthProviderEntity, (authProvider)=>authProvider.user)
    authProviders: AuthProviderEntity[];

    @OneToMany(() => SessionEntity, (session) => session.user)
    sessions: SessionEntity[];
}