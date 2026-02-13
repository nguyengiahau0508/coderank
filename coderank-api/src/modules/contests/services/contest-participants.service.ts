import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { ContestParticipantsEntity } from "../entities/contest-participants.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class ContestParticipantsService extends BaseService<ContestParticipantsEntity> {
  constructor(@InjectRepository(ContestParticipantsEntity) protected readonly repository: Repository<ContestParticipantsEntity>) {
    super(repository);
  }
}
