import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContestsService } from './services/contests.service';
import { ContestParticipantsService } from './services/contest-participants.service';
import { ContestProblemsService } from './services/contest-problems.service';
import { ContestSubmissionsService } from './services/contest-submissions.service';
import { CurrentUser, Public, Roles } from 'src/auth/decorators';
import { ContestStatusEnum, RolesEnum } from 'src/common/enums/enums';
import { CreateContestDto } from './dto/contests/create-contest.dto';
import type { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Owner } from 'src/auth/decorators/owner.decorator';
import { ContestsEntity } from './entities/contests.entity';
import { UpdateContestDto } from './dto/contests/update-contest.dto';
import { PaginationQueryContestsDto } from './dto/contests/pagination-query-contest.dto';
import { PaginatedResponseDto } from 'src/common/dto';
import { AddProblemToContestDto } from './dto/contest-problems/add-problem-to-contest.dto';
import { UpdateContestProblemDto } from './dto/contest-problems/update-contest-problem.dto';
import { JoinContestDto } from './dto/contest-participants/join-contest.dto';
import { CreateContestSubmissionDto } from './dto/contest-submissions/create-contest-submission.dto';

@ApiTags('Contests')
@Controller('contests')
export class ContestsController {
  constructor(
    private readonly contestsService: ContestsService,
    private readonly contestParticipantsService: ContestParticipantsService,
    private readonly contestProblemsService: ContestProblemsService,
    private readonly contestSubmissionsService: ContestSubmissionsService,
  ) {}

  // ==================== Contest Management ====================

  @Post()
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new contest',
    description: 'Admin and Instructor can create contests',
  })
  async createContest(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() createContestDto: CreateContestDto,
  ) {
    return this.contestsService.create({
      ...createContestDto,
      startTime: new Date(createContestDto.startTime),
      endTime: new Date(createContestDto.endTime),
      authorId: currentUser.userId,
    });
  }

  @Get(':contestId')
  @Public()
  @ApiOperation({
    summary: 'Get contest by ID',
    description: 'Get detailed information about a specific contest',
  })
  async getContest(@Param('contestId') contestId: string) {
    return this.contestsService.findOne({
      where: { id: contestId },
      relations: { contestProblems: true, participants: true },
    });
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all contests',
    description: 'Get paginated list of contests with filters',
  })
  async getContests(
    @Query() dto: PaginationQueryContestsDto,
  ): Promise<PaginatedResponseDto<ContestsEntity>> {
    const result = await this.contestsService.getContests(dto);
    return {
      success: true,
      statusCode: 200,
      message: 'Success',
      data: result.items,
      meta: {
        totalItems: result.totalItems,
        page: result.currentPage,
        totalPages: result.totalPages,
        limit: dto.limit || 10,
        hasNext: result.currentPage < result.totalPages,
        hasPrevious: result.currentPage > 1,
      },
      timestamp: new Date().toISOString(),
      path: '/contests',
    };
  }

  @Patch(':contestId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(ContestsEntity, 'authorId', 'contestId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update contest',
    description: 'Update contest details (owner only)',
  })
  async updateContest(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() updateContestDto: UpdateContestDto,
    @Param('contestId') contestId: string,
  ) {
    const { startTime, endTime, ...rest } = updateContestDto;
    const updatedContest = await this.contestsService.update(contestId, {
      ...rest,
      ...(startTime && { startTime: new Date(startTime) }),
      ...(endTime && { endTime: new Date(endTime) }),
      authorId: currentUser.userId,
    });

    if (updateContestDto.status === ContestStatusEnum.Ended) {
      await this.contestsService.ensureContestRankCalculated(contestId);
    } else if (updateContestDto.status) {
      await this.contestsService.markContestRankUncalculated(contestId);
    }

    return updatedContest;
  }

  @Delete(':contestId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(ContestsEntity, 'authorId', 'contestId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete contest',
    description: 'Delete a contest (owner only)',
  })
  async deleteContest(@Param('contestId') contestId: string) {
    return this.contestsService.delete(contestId);
  }

  // ==================== Contest Problems ====================

  @Post(':contestId/problems')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(ContestsEntity, 'authorId', 'contestId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Add problem to contest',
    description: 'Add a problem to the contest (owner only)',
  })
  async addProblemToContest(
    @Param('contestId') contestId: string,
    @Body() dto: AddProblemToContestDto,
  ) {
    return this.contestProblemsService.create({
      contestId: contestId,
      problemId: dto.problemId,
      problemOrder: dto.problemOrder || 0,
      points: dto.points || 100,
      label: dto.label,
    });
  }

  @Get(':contestId/problems')
  @Public()
  @ApiOperation({
    summary: 'Get contest problems',
    description: 'Get all problems in a contest',
  })
  async getContestProblems(@Param('contestId') contestId: string) {
    return this.contestProblemsService.find({
      where: { contestId: contestId },
      relations: { problem: true },
      order: { problemOrder: 'ASC' },
    });
  }

  @Get(':contestId/problems/:problemId')
  @Public()
  @ApiOperation({
    summary: 'Get contest problem',
    description: 'Get a specific problem in a contest',
  })
  async getContestProblem(
    @Param('contestId') contestId: string,
    @Param('problemId') problemId: string,
  ) {
    return this.contestProblemsService.findOne({
      where: { contestId: contestId, problemId: problemId },
      relations: { problem: true },
    });
  }

  @Patch(':contestId/problems/:problemId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(ContestsEntity, 'authorId', 'contestId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update contest problem',
    description: 'Update problem settings in contest (owner only)',
  })
  async updateContestProblem(
    @Body() dto: UpdateContestProblemDto,
    @Param('contestId') contestId: string,
    @Param('problemId') problemId: string,
  ) {
    const contestProblem = await this.contestProblemsService.findOne({
      where: { contestId: contestId, problemId: problemId },
    });

    if (!contestProblem) {
      throw new BadRequestException('Contest problem not found');
    }

    return this.contestProblemsService.update(contestProblem.id, dto);
  }

  @Delete(':contestId/problems/:problemId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(ContestsEntity, 'authorId', 'contestId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Remove problem from contest',
    description: 'Remove a problem from contest (owner only)',
  })
  async removeProblemFromContest(
    @Param('contestId') contestId: string,
    @Param('problemId') problemId: string,
  ) {
    const contestProblem = await this.contestProblemsService.findOne({
      where: { contestId: contestId, problemId: problemId },
    });

    if (!contestProblem) {
      throw new BadRequestException('Contest problem not found');
    }

    return this.contestProblemsService.delete(contestProblem.id);
  }

  // ==================== Contest Participants ====================

  @Post(':contestId/join')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Join contest',
    description: 'Join a contest (requires password for private contests)',
  })
  async joinContest(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('contestId') contestId: string,
    @Body() dto: JoinContestDto,
  ) {
    return this.contestParticipantsService.joinContest(
      currentUser.userId,
      contestId,
      dto.password,
    );
  }

  @Get(':contestId/participants')
  @Public()
  @ApiOperation({
    summary: 'Get contest participants',
    description: 'Get all participants of a contest',
  })
  async getContestParticipants(@Param('contestId') contestId: string) {
    await this.contestsService.ensureContestRankCalculated(contestId);
    return this.contestParticipantsService.find({
      where: { contestId: contestId },
      relations: { user: true },
      order: { rank: 'ASC' },
    });
  }

  @Get(':contestId/participants/me')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my contest participation',
    description: 'Get current user participation info in contest',
  })
  async getMyParticipation(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('contestId') contestId: string,
  ) {
    return this.contestParticipantsService.getMyParticipation(
      currentUser.userId,
      contestId,
    );
  }

  @Get(':contestId/leaderboard')
  @Public()
  @ApiOperation({
    summary: 'Get contest leaderboard',
    description: 'Get contest rankings sorted by score',
  })
  async getContestLeaderboard(@Param('contestId') contestId: string) {
    await this.contestsService.ensureContestRankCalculated(contestId);
    return this.contestParticipantsService.getLeaderboard(contestId);
  }

  @Delete(':contestId/participants/:userId')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(ContestsEntity, 'authorId', 'contestId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Remove participant',
    description: 'Remove a participant from contest (owner only)',
  })
  async removeParticipant(
    @Param('contestId') contestId: string,
    @Param('userId') userId: string,
  ) {
    const participant = await this.contestParticipantsService.findOne({
      where: { contestId: contestId, userId: userId },
    });

    if (!participant) {
      throw new BadRequestException('Participant not found');
    }

    await this.contestParticipantsService.delete(participant.id);
    await this.contestParticipantsService.recalculateLeaderboard(contestId);
    await this.contestParticipantsService.emitLeaderboardUpdate(contestId);
    return { message: 'Participant removed' };
  }

  @Post(':contestId/leave')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Leave contest',
    description: 'Student can leave a contest before it starts',
  })
  async leaveContest(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('contestId') contestId: string,
  ) {
    return this.contestParticipantsService.leaveContest(
      currentUser.userId,
      contestId,
    );
  }

  // ==================== Contest Submissions ====================

  @Post(':contestId/problems/:problemId/submit')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Submit solution',
    description: 'Submit a solution for a problem in contest',
  })
  async submitSolution(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('contestId') contestId: string,
    @Param('problemId') problemId: string,
    @Body() dto: CreateContestSubmissionDto,
  ) {
    return this.contestSubmissionsService.submit(
      currentUser.userId,
      contestId,
      problemId,
      dto,
    );
  }

  @Get(':contestId/submissions')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my contest submissions',
    description: 'Get all submissions by current user in contest',
  })
  async getContestSubmissions(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('contestId') contestId: string,
  ) {
    return this.contestSubmissionsService.find({
      where: {
        contestId: contestId,
        userId: currentUser.userId,
      },
      relations: { problem: true },
      order: { submittedAt: 'DESC' },
    });
  }

  @Get(':contestId/problems/:problemId/submissions')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my problem submissions',
    description: 'Get all submissions by current user for a specific problem',
  })
  async getContestProblemSubmissions(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('contestId') contestId: string,
    @Param('problemId') problemId: string,
  ) {
    return this.contestSubmissionsService.find({
      where: {
        contestId: contestId,
        problemId: problemId,
        userId: currentUser.userId,
      },
      order: { submittedAt: 'DESC' },
    });
  }

  @Get(':contestId/submissions/:submissionId')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get submission details',
    description: 'Get detailed information about a submission',
  })
  async getContestSubmission(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('contestId') contestId: string,
    @Param('submissionId') submissionId: string,
  ) {
    return this.contestSubmissionsService.findOne({
      where: {
        id: submissionId,
        contestId: contestId,
        userId: currentUser.userId,
      },
      relations: { problem: true },
    });
  }

  @Get(':contestId/all-submissions')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @Owner(ContestsEntity, 'authorId', 'contestId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all contest submissions',
    description: 'Get all submissions in contest (owner only)',
  })
  async getAllContestSubmissions(@Param('contestId') contestId: string) {
    return this.contestSubmissionsService.getAllSubmissionsByContestId(
      contestId,
    );
  }
}
