import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { UsersEntity } from "../entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService extends BaseService<UsersEntity>{
    // User service methods would go here
    constructor(
        @InjectRepository(UsersEntity) userRepository: Repository<UsersEntity>,
    ) {
        super(userRepository);
    }
}