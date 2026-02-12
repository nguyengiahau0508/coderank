import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { SubmissionsEntity } from "../entities/submissions.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class SubmissionsService extends BaseService<SubmissionsEntity> {
  constructor(
    @InjectRepository(SubmissionsEntity) protected readonly submissionRepository: Repository<SubmissionsEntity>
  ) {
    super(submissionRepository);
  }
}
