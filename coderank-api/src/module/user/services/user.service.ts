import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserService extends BaseService<UserEntity>{
    // User service methods would go here
    constructor(
        @InjectRepository(UserEntity) userRepository: Repository<UserEntity>,
    ) {
        super(userRepository);
    }
}