import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesEnum } from 'src/common/enums/enums';
import { AiHintsService } from './services/ai-hints.service';
import { CodeReviewsService } from './services/code-reviews.service';
import { UserSkillProfilesService } from './services/user-skill-profiles.service';
import { LearningPathsService } from './services/learning-paths.service';
import { TestcaseGeneratorService } from './services/testcase-generator.service';
import { ClassAnalyticsService } from './services/class-analytics.service';
import { AiGradingService } from './services/ai-grading.service';
import {
  GenerateHintsDto,
  GetHintsQueryDto,
  RequestCodeReviewDto,
  GenerateLearningPathDto,
  GenerateTestcasesDto,
  GenerateAnalyticsDto,
  GradeSubmissionDto,
  VerifyGradingDto,
} from './dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('AI Features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiFeaturesController {
  constructor(
    private readonly aiHintsService: AiHintsService,
    private readonly codeReviewsService: CodeReviewsService,
    private readonly skillProfilesService: UserSkillProfilesService,
    private readonly learningPathsService: LearningPathsService,
    private readonly testcaseGeneratorService: TestcaseGeneratorService,
    private readonly classAnalyticsService: ClassAnalyticsService,
    private readonly aiGradingService: AiGradingService,
  ) {}

  // ==================== AI HINTS ====================

  @Get('problems/:problemId/hints')
  @ApiOperation({ summary: 'Get AI-generated hints for a problem' })
  @ApiParam({ name: 'problemId', description: 'Problem ID' })
  async getHints(
    @Param('problemId', ParseUUIDPipe) problemId: string,
    @Query() query: GetHintsQueryDto,
  ) {
    return this.aiHintsService.getHintsForProblem(
      problemId,
      query.maxLevel,
      query.lang,
    );
  }

  @Post('problems/:problemId/hints/generate')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor, RolesEnum.ProblemSetter)
  @ApiOperation({ summary: 'Generate AI hints for a problem (Instructor+)' })
  @ApiParam({ name: 'problemId', description: 'Problem ID' })
  async generateHints(
    @Param('problemId', ParseUUIDPipe) problemId: string,
    @Body() dto: GenerateHintsDto,
  ) {
    return this.aiHintsService.generateHints(
      problemId,
      dto.maxLevel,
      dto.forceRegenerate,
    );
  }

  // ==================== CODE REVIEWS ====================

  @Get('submissions/:submissionId/review')
  @ApiOperation({ summary: 'Get AI code review for a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  async getCodeReview(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ) {
    return this.codeReviewsService.getReviewForSubmission(submissionId);
  }

  @Post('submissions/:submissionId/review')
  @ApiOperation({ summary: 'Request AI code review for a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  async requestCodeReview(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: RequestCodeReviewDto,
  ) {
    return this.codeReviewsService.requestReview(submissionId, dto.lang);
  }

  @Get('users/me/review-stats')
  @ApiOperation({ summary: 'Get code review statistics for current user' })
  async getMyReviewStats(@CurrentUser() user: any) {
    return this.codeReviewsService.getUserReviewStats(user.id);
  }

  // ==================== SKILL PROFILES ====================

  @Get('users/me/skill-profile')
  @ApiOperation({ summary: 'Get current user skill profile' })
  async getMySkillProfile(@CurrentUser() user: any) {
    return this.skillProfilesService.analyzeAndUpdateProfile(user.id);
  }

  @Get('users/me/recommended-problems')
  @ApiOperation({ summary: 'Get personalized problem recommendations' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecommendedProblems(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    return this.skillProfilesService.getRecommendedProblems(user.id, limit || 10);
  }

  // ==================== LEARNING PATHS ====================

  @Get('learning-paths')
  @ApiOperation({ summary: 'Get all learning paths for current user' })
  async getMyLearningPaths(@CurrentUser() user: any) {
    return this.learningPathsService.getUserLearningPaths(user.id);
  }

  @Get('learning-paths/active')
  @ApiOperation({ summary: 'Get active learning path for current user' })
  async getActiveLearningPath(@CurrentUser() user: any) {
    return this.learningPathsService.getActiveLearningPath(user.id);
  }

  @Get('learning-paths/:pathId')
  @ApiOperation({ summary: 'Get a specific learning path' })
  @ApiParam({ name: 'pathId', description: 'Learning path ID' })
  async getLearningPath(@Param('pathId', ParseUUIDPipe) pathId: string) {
    return this.learningPathsService.findById(pathId);
  }

  @Post('learning-paths/generate')
  @ApiOperation({ summary: 'Generate a personalized learning path' })
  async generateLearningPath(
    @CurrentUser() user: any,
    @Body() dto: GenerateLearningPathDto,
  ) {
    return this.learningPathsService.generateLearningPath(
      user.id,
      dto.goalTopic,
      dto.targetLevel,
    );
  }

  @Post('learning-paths/:pathId/steps/:stepIndex/complete')
  @ApiOperation({ summary: 'Mark a learning path step as completed' })
  @ApiParam({ name: 'pathId', description: 'Learning path ID' })
  @ApiParam({ name: 'stepIndex', description: 'Step index (0-based)' })
  async completeStep(
    @Param('pathId', ParseUUIDPipe) pathId: string,
    @Param('stepIndex') stepIndex: number,
  ) {
    return this.learningPathsService.completeStep(pathId, Number(stepIndex));
  }
}
