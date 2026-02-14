import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { ContestProblemsEntity } from "../entities/contest-problems.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class ContestProblemsService extends BaseService<ContestProblemsEntity> {
  constructor(@InjectRepository(ContestProblemsEntity) protected readonly repository: Repository<ContestProblemsEntity>) {
    super(repository);
  }
}
