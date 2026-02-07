import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ProblemsService } from "./services/problems.service";
import { CurrentUser,  Public,  Roles } from "src/auth/decorators";
import { ApiProblemsCreate,  ApiProblemsDelete,  ApiProblemsTagCreate,  ApiProblemsTagDelete,  ApiProblemsTestcaseCreate, ApiProblemsTestcaseDelete, ApiProblemsTestcaseUpdate, ApiProblemsUpdate } from "./decorator/problems-swagger.decorator";
import { RolesEnum } from "src/common/enums/enums";
import { CreateProblemDto } from "./dto/problem/create-problem.dto";
import type { IJwtPayload } from "src/common/interfaces/jwt-payload.interface";
import { Owner } from "src/auth/decorators/owner.decorator";
import { ProblemsEntity } from "./entities/problems.entity";
import { UpdateProblemDto } from "./dto/problem/update-problem.dto";
import { TestcasesService } from "./services/testcases.service";
import { PaginationQueryProblemsDto } from "./dto/problem/pagination-query-problem.dto";
import { PaginatedResponseDto } from "src/common/dto";
import { CreateTestcaseDto } from "./dto/testcase/create-testcase.dto";

@Controller("problems")
export class ProblemsController {
    constructor(
        private readonly problemsService: ProblemsService,
        private readonly testcasesService: TestcasesService,
    ) { }

    @Post()
    @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
    @ApiProblemsCreate()
    async createProblem(
        @CurrentUser() currentUser: IJwtPayload,
        @Body() createProblemDto: CreateProblemDto
    ) {
        return this.problemsService.create({
            ...createProblemDto,
            authorId: currentUser.userId,
        });
    }

    @Get(':problemId')
    @Public()
    async getProblem(
        @Param('problemId') problemId: string
    ) {
        return this.problemsService.findOne({
            where:{ id: problemId},
            relations: {tags: true, hints: true}
        });
    }

    @Get()
    @Public()
    async getProblems(
        @Query() dto: PaginationQueryProblemsDto
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
    @ApiProblemsUpdate()
    async updateProblem(
        @CurrentUser() currentUser: IJwtPayload,
        @Body() updateProblemDto: UpdateProblemDto,
        @Param('problemId') problemId: string
    ) {;
        return this.problemsService.update(problemId, {
            ...updateProblemDto,
            authorId: currentUser.userId,
        });
    }

    @Delete(':problemId')
    @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
    @Owner(ProblemsEntity, 'authorId', 'problemId')
    @ApiProblemsDelete()
    async deleteProblem(
        @CurrentUser() currentUser: IJwtPayload,
        @Param('problemId') problemId: string
    ) {
        return this.problemsService.delete(problemId);
    }

    @Post(':problemId/testcases')
    @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
    @Owner(ProblemsEntity, 'authorId', 'problemId')
    @ApiProblemsTestcaseCreate()
    async createTestcase(
        @Body() createTestcaseDto: CreateTestcaseDto,
        @Param('problemId') problemId: string
    ) {
        return this.testcasesService.create({
            ...createTestcaseDto,
            problemId: problemId,
        });
    }

    @Get(':problemId/testcases/:testcaseId')
    @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
    @Owner(ProblemsEntity, 'authorId', 'problemId')
    async getTestcase(
        @Param('testcaseId') testcaseId: string,
        @Param('problemId') problemId: string
    ) {
        return this.testcasesService.findOne({
            where:{ id: testcaseId, problemId: problemId }
        });
    }

    @Patch(':problemId/testcases/:testcaseId')
    @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
    @Owner(ProblemsEntity, 'authorId', 'problemId')
    @ApiProblemsTestcaseUpdate()
    async updateTestcase(
        @CurrentUser() currentUser: IJwtPayload,
        @Body() updateTestcaseDto: any,
        @Param('problemId') problemId: string,
        @Param('testcaseId') testcaseId: string
    ) {
        return this.testcasesService.update(testcaseId, {
            ...updateTestcaseDto,
            problemId: problemId,
            authorId: currentUser.userId,
        });
    }

    @Delete(':problemId/testcases/:testcaseId')
    @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
    @Owner(ProblemsEntity, 'authorId', 'problemId')
    @ApiProblemsTestcaseDelete()
    async deleteTestcase(
        @Param('testcaseId') testcaseId: string
    ) {
        return this.testcasesService.delete(testcaseId);
    }

    @Post(':problemId/tags/:tagId')
    @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
    @Owner(ProblemsEntity, 'authorId', 'problemId')
    @ApiProblemsTagCreate()
    async addTagToProblem(
        @Param('problemId') problemId: string,
        @Param('tagId') tagId: string
    ) {
        return this.problemsService.addTag(problemId, tagId);
    }

    @Delete(':problemId/tags/:tagId')
    @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
    @Owner(ProblemsEntity, 'authorId', 'problemId')
    @ApiProblemsTagDelete()
    async removeTagFromProblem(
        @Param('problemId') problemId: string,
        @Param('tagId') tagId: string
    ) {
        return this.problemsService.removeTag(problemId, tagId);
    }
}   