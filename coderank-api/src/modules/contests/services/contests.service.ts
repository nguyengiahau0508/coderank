import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { ContestsEntity } from "../entities/contests.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class ContestsService extends BaseService<ContestsEntity> {
  constructor(@InjectRepository(ContestsEntity) protected readonly repository: Repository<ContestsEntity>) {
    super(repository);
  }
}
