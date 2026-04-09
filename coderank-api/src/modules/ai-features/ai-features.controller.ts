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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesEnum } from 'src/common/enums/enums';
import type { Request } from 'express';
import type { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { AiHintsService } from './services/ai-hints.service';
import { CodeReviewsService } from './services/code-reviews.service';
import { UserSkillProfilesService } from './services/user-skill-profiles.service';
import { LearningPathsService } from './services/learning-paths.service';
import { TestcaseGeneratorService } from './services/testcase-generator.service';
import { ClassAnalyticsService } from './services/class-analytics.service';
import { AiGradingService } from './services/ai-grading.service';
import { ErrorExplanationService } from './services/error-explanation.service';
import { AiAssistantService } from './services/ai-assistant.service';
import { PlagiarismReportsService } from './services/plagiarism-reports.service';
import {
  GenerateHintsDto,
  GetHintsQueryDto,
  RequestCodeReviewDto,
  GenerateLearningPathDto,
  GenerateTestcasesDto,
  GenerateAnalyticsDto,
  GradeSubmissionDto,
  VerifyGradingDto,
  ExplainSubmissionErrorDto,
  AlgorithmSuggestionDto,
  ExplainSolutionDto,
  TranslateCodeDto,
  GenerateProblemDraftDto,
  PlagiarismCheckDto,
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
    private readonly errorExplanationService: ErrorExplanationService,
    private readonly aiAssistantService: AiAssistantService,
    private readonly plagiarismReportsService: PlagiarismReportsService,
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

  @Post('submissions/:submissionId/plagiarism-check')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiOperation({ summary: 'Run plagiarism check for a submission (Instructor+)' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  async checkPlagiarism(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: PlagiarismCheckDto,
  ) {
    return this.plagiarismReportsService.checkSubmissionPlagiarism(
      submissionId,
      dto.threshold,
    );
  }

  @Get('submissions/:submissionId/plagiarism-report')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiOperation({ summary: 'Get latest plagiarism report for a submission (Instructor+)' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  async getPlagiarismReport(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ) {
    return this.plagiarismReportsService.getLatestReportForSubmission(submissionId);
  }

  @Get('users/me/review-stats')
  @ApiOperation({ summary: 'Get code review statistics for current user' })
  async getMyReviewStats(@CurrentUser() user: any) {
    return this.codeReviewsService.getUserReviewStats(user.userId);
  }

  @Post('submissions/:submissionId/error-explanation')
  @ApiOperation({ summary: 'Generate AI explanation for a failed submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  async explainSubmissionError(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: ExplainSubmissionErrorDto,
  ) {
    return this.errorExplanationService.explainSubmissionError(
      submissionId,
      dto.lang,
      dto.forceRegenerate,
    );
  }

  // ==================== SKILL PROFILES ====================

  @Get('users/me/skill-profile')
  @ApiOperation({ summary: 'Get current user skill profile' })
  async getMySkillProfile(@CurrentUser() user: any) {
    return this.skillProfilesService.analyzeAndUpdateProfile(user.userId);
  }

  @Get('users/me/recommended-problems')
  @ApiOperation({ summary: 'Get personalized problem recommendations' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecommendedProblems(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    return this.skillProfilesService.getRecommendedProblems(
      user.userId,
      limit || 10,
    );
  }

  // ==================== LEARNING PATHS ====================

  @Get('learning-paths')
  @ApiOperation({ summary: 'Get all learning paths for current user' })
  async getMyLearningPaths(@CurrentUser() user: any) {
    return this.learningPathsService.getUserLearningPaths(user.userId);
  }

  @Get('learning-paths/active')
  @ApiOperation({ summary: 'Get active learning path for current user' })
  async getActiveLearningPath(@CurrentUser() user: any) {
    return this.learningPathsService.getActiveLearningPath(user.userId);
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
      user.userId,
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
    @Param('stepIndex', ParseIntPipe) stepIndex: number,
  ) {
    return this.learningPathsService.completeStep(pathId, stepIndex);
  }

  // ==================== TESTCASE GENERATION ====================

  @Post('problems/:problemId/testcases/generate')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor, RolesEnum.ProblemSetter)
  @ApiOperation({
    summary: 'Generate AI testcases for a problem (Instructor+)',
  })
  @ApiParam({ name: 'problemId', description: 'Problem ID' })
  async generateTestcases(
    @Param('problemId', ParseUUIDPipe) problemId: string,
    @Body() dto: GenerateTestcasesDto,
  ) {
    return this.testcaseGeneratorService.generateTestcases(problemId, dto);
  }

  @Get('problems/:problemId/testcases')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor, RolesEnum.ProblemSetter)
  @ApiOperation({
    summary: 'Get AI generated testcases for a problem (Instructor+)',
  })
  @ApiParam({ name: 'problemId', description: 'Problem ID' })
  @ApiQuery({ name: 'approvedOnly', required: false, type: Boolean })
  async getGeneratedTestcases(
    @Param('problemId', ParseUUIDPipe) problemId: string,
    @Query('approvedOnly') approvedOnly?: string,
  ) {
    return this.testcaseGeneratorService.getTestcasesForProblem(
      problemId,
      approvedOnly === 'true',
    );
  }

  @Post('testcases/:testcaseId/approve')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor, RolesEnum.ProblemSetter)
  @ApiOperation({ summary: 'Approve generated testcase (Instructor+)' })
  @ApiParam({ name: 'testcaseId', description: 'Testcase ID' })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  async approveTestcase(
    @Param('testcaseId', ParseUUIDPipe) testcaseId: string,
    @Query('isPublic') isPublic?: string,
  ) {
    return this.testcaseGeneratorService.approveTestcase(
      testcaseId,
      isPublic === 'true',
    );
  }

  // ==================== CLASS ANALYTICS ====================

  @Post('courses/:courseId/analytics/generate')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiOperation({
    summary: 'Generate analytics snapshot for a course (Instructor+)',
  })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async generateCourseAnalytics(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: GenerateAnalyticsDto,
  ) {
    return this.classAnalyticsService.generateAnalytics(
      courseId,
      new Date(dto.periodStart),
      new Date(dto.periodEnd),
    );
  }

  @Get('courses/:courseId/analytics/latest')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiOperation({ summary: 'Get latest analytics for a course (Instructor+)' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async getLatestCourseAnalytics(
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.classAnalyticsService.getLatestAnalytics(courseId);
  }

  @Get('courses/:courseId/analytics/history')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiOperation({ summary: 'Get analytics history for a course (Instructor+)' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCourseAnalyticsHistory(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query('limit') limit?: number,
  ) {
    return this.classAnalyticsService.getAnalyticsHistory(
      courseId,
      limit || 10,
    );
  }

  // ==================== AI RUBRIC GRADING ====================

  @Post('submissions/:submissionId/grade')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiOperation({ summary: 'AI rubric grading for a submission (Instructor+)' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  async gradeSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: any,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.aiGradingService.gradeSubmission(
      submissionId,
      dto.rubric,
      user.userId,
    );
  }

  @Get('submissions/:submissionId/grading')
  @ApiOperation({ summary: 'Get AI grading for a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  async getSubmissionGrading(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ) {
    return this.aiGradingService.getGradingForSubmission(submissionId);
  }

  @Post('gradings/:gradingId/verify')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor)
  @ApiOperation({ summary: 'Verify or override AI grading (Instructor+)' })
  @ApiParam({ name: 'gradingId', description: 'Grading ID' })
  async verifyGrading(
    @Param('gradingId', ParseUUIDPipe) gradingId: string,
    @CurrentUser() user: any,
    @Body() dto: VerifyGradingDto,
  ) {
    return this.aiGradingService.verifyGrading(
      gradingId,
      user.userId,
      dto.overrideScore,
      dto.overrideFeedback,
    );
  }

  // ==================== ALGO / DS SUGGESTIONS ====================

  @Post('problems/:problemId/algorithm-suggestion')
  @ApiOperation({ summary: 'Get AI algorithm suggestion for a problem' })
  @ApiParam({ name: 'problemId', description: 'Problem ID' })
  async suggestAlgorithm(
    @Param('problemId', ParseUUIDPipe) problemId: string,
    @Body() dto: AlgorithmSuggestionDto,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    const userToken = (req.headers.authorization as string)?.replace('Bearer ', '');
    return this.aiAssistantService.suggestAlgorithm(
      problemId,
      user.userId,
      userToken,
      user.roles?.[0] || RolesEnum.Student,
      dto,
    );
  }

  @Post('problems/:problemId/data-structure-suggestion')
  @ApiOperation({ summary: 'Get AI data-structure suggestion for a problem' })
  @ApiParam({ name: 'problemId', description: 'Problem ID' })
  async suggestDataStructure(
    @Param('problemId', ParseUUIDPipe) problemId: string,
    @Body() dto: AlgorithmSuggestionDto,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    const userToken = (req.headers.authorization as string)?.replace('Bearer ', '');
    return this.aiAssistantService.suggestDataStructure(
      problemId,
      user.userId,
      userToken,
      user.roles?.[0] || RolesEnum.Student,
      dto,
    );
  }

  // ==================== ADVANCED STUDENT ASSIST ====================

  @Post('submissions/:submissionId/debug-assist')
  @ApiOperation({ summary: 'Get AI debugging guidance for a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  async debugAssist(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: ExplainSubmissionErrorDto,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    const userToken = (req.headers.authorization as string)?.replace('Bearer ', '');
    return this.aiAssistantService.debugSubmission(
      submissionId,
      user.userId,
      userToken,
      user.roles?.[0] || RolesEnum.Student,
      dto.lang || 'vi',
      dto.provider,
    );
  }

  @Post('submissions/:submissionId/explain-solution')
  @ApiOperation({ summary: 'Explain a submission solution with AI' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  async explainSolution(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: ExplainSolutionDto,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    const userToken = (req.headers.authorization as string)?.replace('Bearer ', '');
    return this.aiAssistantService.explainSubmissionSolution(
      submissionId,
      user.userId,
      userToken,
      user.roles?.[0] || RolesEnum.Student,
      dto.lang || 'vi',
      dto.detail || 'detailed',
      dto.provider,
    );
  }

  @Post('submissions/:submissionId/optimize-suggestions')
  @ApiOperation({ summary: 'Get AI optimization suggestions for a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  async optimizeSuggestions(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: ExplainSubmissionErrorDto,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    const userToken = (req.headers.authorization as string)?.replace('Bearer ', '');
    return this.aiAssistantService.suggestOptimization(
      submissionId,
      user.userId,
      userToken,
      user.roles?.[0] || RolesEnum.Student,
      dto.lang || 'vi',
      dto.provider,
    );
  }

  @Post('code/translate')
  @ApiOperation({ summary: 'Translate code between programming languages using AI' })
  async translateCode(
    @Body() dto: TranslateCodeDto,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    const userToken = (req.headers.authorization as string)?.replace('Bearer ', '');
    return this.aiAssistantService.translateCode(
      dto.sourceCode,
      dto.sourceLanguage,
      dto.targetLanguage,
      user.userId,
      userToken,
      user.roles?.[0] || RolesEnum.Student,
      dto.provider,
    );
  }

  @Post('problems/generate')
  @Roles(RolesEnum.Admin, RolesEnum.Instructor, RolesEnum.ProblemSetter)
  @ApiOperation({ summary: 'Generate AI problem draft (Instructor+)' })
  async generateProblemDraft(
    @Body() dto: GenerateProblemDraftDto,
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
  ) {
    const userToken = (req.headers.authorization as string)?.replace('Bearer ', '');
    return this.aiAssistantService.generateProblemDraft(
      dto.topic,
      dto.difficulty,
      user.userId,
      userToken,
      user.roles?.[0] || RolesEnum.Instructor,
      { constraints: dto.constraints, lang: dto.lang, provider: dto.provider },
    );
  }
}
