import { Inject, Injectable } from "@nestjs/common";
import { AuthProviderEntity } from "../entities/auth-provider.entity";
import { InjectRepository } from "@nestjs/typeorm/dist/common/typeorm.decorators";
import { BaseService } from "src/common/services/base.service";

@Injectable() 
export class AuthProviderService extends BaseService<AuthProviderEntity>{
    constructor(
        @InjectRepository(AuthProviderEntity)
        protected readonly repository,
    ) {
        super(repository);
    }
}