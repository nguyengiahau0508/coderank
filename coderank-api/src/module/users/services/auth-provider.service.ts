import { Inject, Injectable } from "@nestjs/common";
import { AuthProvidersEntity } from "../entities/auth-provider.entity";
import { InjectRepository } from "@nestjs/typeorm/dist/common/typeorm.decorators";
import { BaseService } from "src/common/services/base.service";

@Injectable() 
export class AuthProvidersService extends BaseService<AuthProvidersEntity>{
    constructor(
        @InjectRepository(AuthProvidersEntity)
        protected readonly repository,
    ) {
        super(repository);
    }
}