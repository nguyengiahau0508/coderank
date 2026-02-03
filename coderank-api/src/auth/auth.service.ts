import { Injectable } from "@nestjs/common";
import { AuthProvidersEnum } from "src/common/enums/enums";
import { UserEntity } from "src/module/user/entities/user.entity";
import { UserService } from "src/module/user/services/user.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
    ) { }

    async validateOrCreateUser(profile: {
        providerId: string;
        email: string;
        fullName: string;
        picture?: string;
    }, provider: AuthProvidersEnum) {
        // 1. Tìm user theo email + provider
        const existingUser = await this.userService.findOne({
            where: {
                email: profile.email,
                authProviders: {
                    provider: provider,
                    providerId: profile.providerId,
                }
            }
        });
        // 2. Nếu không tồn tại → Tạo mới user
        if (!existingUser) {
            const newUser = await this.userService.create({
                email: profile.email,
                fullName: profile.fullName,
                avatar: profile.picture,
            });
        }
        // 3. Cập nhật/tạo auth provider record
        // 4. Trả về user
    }
}