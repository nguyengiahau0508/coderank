import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ContestSubmissionsEntity } from '../entities/contest-submissions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContestSubmissionDto } from '../dto/contest-submissions/create-contest-submission.dto';
import { SubmissionStatusEnum } from 'src/common/enums/enums';
import { ContestParticipantsEntity } from '../entities/contest-participants.entity';

@Injectable()
export class ContestSubmissionsService extends BaseService<ContestSubmissionsEntity> {
  constructor(
    @InjectRepository(ContestSubmissionsEntity)
    protected readonly repository: Repository<ContestSubmissionsEntity>,
    @InjectRepository(ContestParticipantsEntity)
    private readonly participantsRepository: Repository<ContestParticipantsEntity>,
  ) {
    super(repository);
  }

  async submit(
    userId: string,
    contestId: string,
    problemId: string,
    dto: CreateContestSubmissionDto,
  ) {
    // Check if user is a participant
    const participant = await this.participantsRepository.findOne({
      where: { userId, contestId },
    });

    if (!participant) {
      throw new BadRequestException('You must join the contest first');
    }

    return this.repository.save({
      userId,
      contestId,
      problemId,
      code: dto.code,
      language: dto.language,
      status: SubmissionStatusEnum.Pending,
      score: 0,
      passedTestcases: 0,
      totalTestcases: 0,
      submittedAt: new Date(),
    });
  }
}
