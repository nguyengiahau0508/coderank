import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { SessionEntity } from "../entities/session.entity";
import { InjectRepository } from "@nestjs/typeorm";


@Injectable() 
export class SessionService extends BaseService<SessionEntity>{
    constructor(
        @InjectRepository(SessionEntity)
        protected readonly repository,
    ) {
        super(repository);
    }
}