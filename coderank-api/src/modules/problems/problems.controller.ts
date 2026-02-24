import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProblemsService } from './services/problems.service';
import { CurrentUser, Public, Roles } from 'src/auth/decorators';
import { RolesEnum } from 'src/common/enums/enums';
import { CreateProblemDto } from './dto/problem/create-problem.dto';
import type { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Owner } from 'src/auth/decorators/owner.decorator';
import { ProblemsEntity } from './entities/problems.entity';
import { UpdateProblemDto } from './dto/problem/update-problem.dto';
import { TestcasesService } from './services/testcases.service';
import { PaginationQueryProblemsDto } from './dto/problem/pagination-query-problem.dto';
import { PaginatedResponseDto } from 'src/common/dto';
import { CreateTestcaseDto } from './dto/testcase/create-testcase.dto';
import { UpdateTestcaseDto } from './dto/testcase/update-testcase.dto';
import { HintsService } from './services/hints.service';
import { CreateHintDto } from './dto/hint/create-hint.dto';
import { UpdateHintDto } from './dto/hint/update-hint.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SubmissionsService } from './services/submissions.serivce';
import { CreateSubmissionDto } from './dto/submission';
import { TagsService } from './services/tags.service';

@Controller('problems')
export class ProblemsController {
  constructor(
    private readonly problemsService: ProblemsService,
    private readonly testcasesService: TestcasesService,
    private readonly hintsService: HintsService,
    private readonly submissionsService: SubmissionsService,
    private readonly tagsService: TagsService
  ) { }

  @Post()
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @ApiBearerAuth('JWT-auth')
  async createProblem(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() createProblemDto: CreateProblemDto,
  ) {
    return this.problemsService.create({
      ...createProblemDto,
      authorId: currentUser.userId,
    });
  }

  @Get('/tags')
  @ApiBearerAuth('JWT-auth')
  async getAllTags() {
    return this.tagsService.findAll();
  }

  @Get(':problemId')
  @ApiBearerAuth('JWT-auth')
  async getProblem(@Param('problemId') problemId: string) {
    return this.problemsService.findOne({
      where: { id: problemId },
      select: ['id', 'title', 'slug', 'description', 'inputDescription', 'outputDescription', 'notes', 'timeLimitMs', 'memoryLimitMb', 'difficulty', 'isPublished', 'points'],
      relations: { tags: true, hints: true },
    });
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  async getProblems(
    @Query() dto: PaginationQueryProblemsDto,
  ): Promise<PaginatedResponseDto<ProblemsEntity>> {
    const result = await this.problemsService.getProblem(dto);
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
      path: '/problems',
    };
  }

  @Patch(':problemId')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async updateProblem(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() updateProblemDto: UpdateProblemDto,
    @Param('problemId') problemId: string,
  ) {
    return this.problemsService.update(problemId, {
      ...updateProblemDto,
      authorId: currentUser.userId,
    });
  }

  @Delete(':problemId')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async deleteProblem(@Param('problemId') problemId: string) {
    return this.problemsService.delete(problemId);
  }

  @Post(':problemId/testcases')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async createTestcase(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() createTestcaseDto: CreateTestcaseDto,
    @Param('problemId') problemId: string,
  ) {
    return this.testcasesService.create({
      ...createTestcaseDto,
      problemId: problemId,
      authorId: currentUser.userId,
    });
  }

  @Get(':problemId/testcases')
  @ApiBearerAuth('JWT-auth')
  async getTestcasesByProblemId(@CurrentUser() currentUser: IJwtPayload, @Param('problemId') problemId: string) {
    const isSample = !(currentUser.roles.includes(RolesEnum.Admin) || currentUser.roles.includes(RolesEnum.ProblemSetter));

    const qb = this.testcasesService.getRepository()
      .createQueryBuilder('tc')
      .addSelect(['tc.input', 'tc.expectedOutput'])
      .where('tc.problemId = :problemId', { problemId });

    if (isSample) {
      qb.andWhere('tc.isSample = :isSample', { isSample: true });
    }

    qb.orderBy('tc.testcaseOrder', 'ASC');

    return qb.getMany();
  }

  @Get(':problemId/testcases/:testcaseId')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async getTestcaseById(
    @Param('problemId') problemId: string,
    @Param('testcaseId') testcaseId: string,
  ) {
    return this.testcasesService.getRepository()
      .createQueryBuilder('tc')
      .addSelect(['tc.input', 'tc.expectedOutput'])
      .where('tc.id = :testcaseId', { testcaseId })
      .andWhere('tc.problemId = :problemId', { problemId })
      .getOne();
  }

  @Patch(':problemId/testcases/:testcaseId')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async updateTestcase(
    @Body() updateTestcaseDto: UpdateTestcaseDto,
    @Param('problemId') problemId: string,
    @Param('testcaseId') testcaseId: string,
  ) {
    return this.testcasesService.update(testcaseId, {
      ...updateTestcaseDto,
      problemId: problemId,
    });
  }

  @Delete(':problemId/testcases/:testcaseId')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async deleteTestcase(
    @Param('problemId') problemId: string,
    @Param('testcaseId') testcaseId: string,
  ) {
    return this.testcasesService.delete(testcaseId);
  }

  @Post(':problemId/tags/:tagId')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async addTagToProblem(
    @Param('problemId') problemId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.problemsService.addTag(problemId, tagId);
  }

  @Delete(':problemId/tags/:tagId')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async removeTagFromProblem(
    @Param('problemId') problemId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.problemsService.removeTag(problemId, tagId);
  }

  @Post(':problemId/hints')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async createHint(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() createHintDto: CreateHintDto,
    @Param('problemId') problemId: string,
  ) {
    return this.hintsService.create({
      ...createHintDto,
      problemId: problemId,
      authorId: currentUser.userId,
    });
  }

  @Get(':problemId/hints')
  @ApiBearerAuth('JWT-auth')
  async getHintsByProblemId(@Param('problemId') problemId: string) {
    return this.hintsService.find({
      where: { problemId: problemId },
      order: { hintOrder: 'ASC' },
    });
  }

  @Get(':problemId/hints/:hintId')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async getHintById(
    @Param('problemId') problemId: string,
    @Param('hintId') hintId: string,
  ) {
    return this.hintsService.findOne({
      where: { id: hintId, problemId: problemId },
    });
  }

  @Patch(':problemId/hints/:hintId')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async updateHint(
    @Body() updateHintDto: UpdateHintDto,
    @Param('problemId') problemId: string,
    @Param('hintId') hintId: string,
  ) {
    return this.hintsService.update(hintId, {
      ...updateHintDto,
      problemId: problemId,
    });
  }

  @Delete(':problemId/hints/:hintId')
  @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
  @Owner(ProblemsEntity, 'authorId', 'problemId')
  @ApiBearerAuth('JWT-auth')
  async deleteHint(
    @Param('problemId') problemId: string,
    @Param('hintId') hintId: string,
  ) {
    return this.hintsService.delete(hintId);
  }

  @Post(':problemId/submissions')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  async submitProblem(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('problemId') problemId: string,
    @Body() dto: CreateSubmissionDto
  ) {
    return this.submissionsService.submit(
      currentUser.userId,
      problemId,
      dto
    );
  }

  @Get(':problemId/submissions')
  @Roles(RolesEnum.Student, RolesEnum.Instructor, RolesEnum.Admin)
  @ApiBearerAuth('JWT-auth')
  async getSubmissionsByProblemId(
    @CurrentUser() currentUser: IJwtPayload,
    @Param('problemId') problemId: string
  ) {
    return this.submissionsService.find({
      where: {
        problemId: problemId,
        authorId: currentUser.userId
      },
      order: { createdAt: 'DESC' },
    });
  }
}
