import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { SessionsEntity } from "../entities/session.entity";
import { InjectRepository } from "@nestjs/typeorm";


@Injectable() 
export class SessionsService extends BaseService<SessionsEntity>{
    constructor(
        @InjectRepository(SessionsEntity)
        protected readonly repository,
    ) {
        super(repository);
    }
}