import { Injectable, Module } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { ProblemsEntity } from "../entities/problems.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class ProblemsService extends BaseService<ProblemsEntity>{
    constructor(
        @InjectRepository(ProblemsEntity)
        protected readonly repository: Repository<ProblemsEntity>,
    ){super(repository)}
}