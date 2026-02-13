import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { ContestSubmissionsEntity } from "../entities/contest-submissions.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class ContestSubmissionsService extends BaseService<ContestSubmissionsEntity> {
  constructor(@InjectRepository(ContestSubmissionsEntity) protected readonly repository: Repository<ContestSubmissionsEntity>) {
    super(repository);
  }
}
