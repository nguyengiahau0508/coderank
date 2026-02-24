import { Injectable, ForbiddenException } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { SolutionsEntity } from '../entities/solutions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmissionsEntity } from '../entities/submissions.entity';
import { SubmissionStatusEnum } from 'src/common/enums/enums';
import { CreateSolutionDto } from '../dto/solution/create-solution.dto';

@Injectable()
export class SolutionsService extends BaseService<SolutionsEntity> {
  constructor(
    @InjectRepository(SolutionsEntity)
    protected readonly repository: Repository<SolutionsEntity>,
    @InjectRepository(SubmissionsEntity)
    private readonly submissionsRepository: Repository<SubmissionsEntity>,
  ) {
    super(repository);
  }

  /**
   * Tạo solution mới - chỉ cho phép khi user đã có submission Accepted cho bài này
   */
  async createSolution(
    userId: string,
    problemId: string,
    dto: CreateSolutionDto,
  ): Promise<SolutionsEntity> {
    // Kiểm tra user đã có submission Accepted cho bài này chưa
    const acceptedSubmission = await this.submissionsRepository.findOne({
      where: {
        authorId: userId,
        problemId: problemId,
        status: SubmissionStatusEnum.Accepted,
      },
    });

    if (!acceptedSubmission) {
      throw new ForbiddenException(
        'Bạn cần giải thành công (Accepted) bài này trước khi chia sẻ solution',
      );
    }

    return this.create({
      ...dto,
      problemId,
      authorId: userId,
    });
  }

  /**
   * Lấy danh sách solutions theo problemId, kèm thông tin author
   */
  async getSolutionsByProblemId(problemId: string): Promise<SolutionsEntity[]> {
    return this.repository.find({
      where: { problemId },
      relations: { author: true },
      order: { upvotes: 'DESC', createdAt: 'DESC' },
      select: {
        author: {
          id: true,
          fullName: true,
          username: true,
          avatarUrl: true,
        },
      },
    });
  }
}
