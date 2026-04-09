import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi, ApiResponse, PaginatedResponse } from '../../../shared';
import { ProblemsModel } from '../models/problems.model';
import { TestcasesModel } from '../models/testcases.model';
import { HintsModel } from '../models/hints.model';
import { SubmissionsModel } from '../models/submissions.model';
import { SolutionsModel } from '../models/solutions.model';
import {
  PaginationQueryParams,
  CreateProblemDto,
  UpdateProblemDto,
  CreateTestcaseDto,
  UpdateTestcaseDto,
  CreateHintDto,
  UpdateHintDto,
  CreateSubmissionDto,
  CreateSolutionDto,
  UpdateSolutionDto,
} from '../dto';
import { TagsModel } from '../models/tags.model';
import { AiProviderEnum } from '../../../shared/enums/enums';

/**
 * Problems API Service
 * Handles all problem-related API calls including testcases, hints, and submissions
 */
@Injectable({
  providedIn: 'root'
})
export class ProblemsApi extends BaseApi {
  protected readonly endpoint = '/problems';

  private getPreferredAiProvider(): AiProviderEnum | undefined {
    const value = localStorage.getItem('ai_preferred_provider_v1');
    if (!value) {
      return undefined;
    }
    return Object.values(AiProviderEnum).includes(value as AiProviderEnum)
      ? (value as AiProviderEnum)
      : undefined;
  }

  // ==================== Problems ====================

  /**
   * Create a new problem (Admin/ProblemSetter only)
   */
  createProblem(dto: CreateProblemDto): Observable<ApiResponse<ProblemsModel>> {
    return this.apiService.post<ApiResponse<ProblemsModel>>(this.endpoint, dto);
  }

  /**
   * Get a single problem by ID
   */
  getProblem(problemId: string): Observable<ApiResponse<ProblemsModel>> {
    return this.apiService.get<ApiResponse<ProblemsModel>>(
      this.getUrl(`/${problemId}`)
    );
  }

  /**
   * Get paginated list of problems with filters
   */
  getProblems(params?: PaginationQueryParams): Observable<PaginatedResponse<ProblemsModel>> {
    return this.apiService.get<PaginatedResponse<ProblemsModel>>(
      this.endpoint,
      this.buildParams(params)
    );
  }

  getMyProblems(params?: PaginationQueryParams): Observable<PaginatedResponse<ProblemsModel>> {
    return this.apiService.get<PaginatedResponse<ProblemsModel>>(
      this.getUrl('/me'),
      this.buildParams(params)
    );
  }

  /**
   * Update a problem (Admin/ProblemSetter/Owner only)
   */
  updateProblem(problemId: string, dto: UpdateProblemDto): Observable<ApiResponse<ProblemsModel>> {
    return this.apiService.patch<ApiResponse<ProblemsModel>>(
      this.getUrl(`/${problemId}`),
      dto
    );
  }

  /**
   * Delete a problem (Admin/ProblemSetter/Owner only)
   */
  deleteProblem(problemId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${problemId}`)
    );
  }

  // ==================== Testcases ====================

  /**
   * Create a new testcase for a problem
   */
  createTestcase(problemId: string, dto: CreateTestcaseDto): Observable<ApiResponse<TestcasesModel>> {
    return this.apiService.post<ApiResponse<TestcasesModel>>(
      this.getUrl(`/${problemId}/testcase`),
      dto
    );
  }

  getSampleTestcases(problemId: string): Observable<ApiResponse<TestcasesModel[]>> {
    return this.apiService.get<ApiResponse<TestcasesModel[]>>(
      this.getUrl(`/${problemId}/testcases/sample`)
    );
  }

  /**
   * Get all testcases for a problem
   */
  getTestcases(problemId: string): Observable<ApiResponse<TestcasesModel[]>> {
    return this.apiService.get<ApiResponse<TestcasesModel[]>>(
      this.getUrl(`/${problemId}/testcases`)
    );
  }

  /**
   * Get a specific testcase by ID
   */
  getTestcase(problemId: string, testcaseId: string): Observable<ApiResponse<TestcasesModel>> {
    return this.apiService.get<ApiResponse<TestcasesModel>>(
      this.getUrl(`/${problemId}/testcases/${testcaseId}`)
    );
  }

  /**
   * Update a testcase
   */
  updateTestcase(
    problemId: string,
    testcaseId: string,
    dto: UpdateTestcaseDto
  ): Observable<ApiResponse<TestcasesModel>> {
    return this.apiService.patch<ApiResponse<TestcasesModel>>(
      this.getUrl(`/${problemId}/testcases/${testcaseId}`),
      dto
    );
  }

  /**
   * Delete a testcase
   */
  deleteTestcase(problemId: string, testcaseId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${problemId}/testcases/${testcaseId}`)
    );
  }

  // ==================== Tags ====================

  /**
   * Add a tag to a problem
   */
  addTag(problemId: string, tagId: string): Observable<ApiResponse<ProblemsModel>> {
    return this.apiService.post<ApiResponse<ProblemsModel>>(
      this.getUrl(`/${problemId}/tags/${tagId}`),
      {}
    );
  }

  getTags(): Observable<ApiResponse<TagsModel[]>> {
    return this.apiService.get<ApiResponse<TagsModel[]>>(
      this.getUrl(`/tags`)
    );
  }

  /**
   * Remove a tag from a problem
   */
  removeTag(problemId: string, tagId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${problemId}/tags/${tagId}`)
    );
  }

  // ==================== Hints ====================

  /**
   * Create a new hint for a problem
   */
  createHint(problemId: string, dto: CreateHintDto): Observable<ApiResponse<HintsModel>> {
    return this.apiService.post<ApiResponse<HintsModel>>(
      this.getUrl(`/${problemId}/hints`),
      dto
    );
  }

  /**
   * Get all hints for a problem
   */
  getHints(problemId: string): Observable<ApiResponse<HintsModel[]>> {
    return this.apiService.get<ApiResponse<HintsModel[]>>(
      this.getUrl(`/${problemId}/hints`)
    );
  }

  /**
   * Get a specific hint by ID
   */
  getHint(problemId: string, hintId: string): Observable<ApiResponse<HintsModel>> {
    return this.apiService.get<ApiResponse<HintsModel>>(
      this.getUrl(`/${problemId}/hints/${hintId}`)
    );
  }

  /**
   * Update a hint
   */
  updateHint(
    problemId: string,
    hintId: string,
    dto: UpdateHintDto
  ): Observable<ApiResponse<HintsModel>> {
    return this.apiService.patch<ApiResponse<HintsModel>>(
      this.getUrl(`/${problemId}/hints/${hintId}`),
      dto
    );
  }

  /**
   * Delete a hint
   */
  deleteHint(problemId: string, hintId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${problemId}/hints/${hintId}`)
    );
  }

  // ==================== Submissions ====================

  /**
   * Submit a solution for a problem
   */
  submitSolution(problemId: string, dto: CreateSubmissionDto): Observable<ApiResponse<SubmissionsModel>> {
    return this.apiService.post<ApiResponse<SubmissionsModel>>(
      this.getUrl(`/${problemId}/submissions`),
      dto
    );
  }

  /**
   * Get all submissions for a problem (current user only)
   */
  getSubmissions(problemId: string): Observable<ApiResponse<SubmissionsModel[]>> {
    return this.apiService.get<ApiResponse<SubmissionsModel[]>>(
      this.getUrl(`/${problemId}/submissions`)
    );
  }

  getSubmission(problemId: string, submissionId: string): Observable<ApiResponse<SubmissionsModel>> {
    return this.apiService.get<ApiResponse<SubmissionsModel>>(
      this.getUrl(`/${problemId}/submissions/${submissionId}`)
    );
  }

  // ==================== Solutions ====================

  /**
   * Create a new solution for a problem (requires Accepted submission)
   */
  createSolution(problemId: string, dto: CreateSolutionDto): Observable<ApiResponse<SolutionsModel>> {
    return this.apiService.post<ApiResponse<SolutionsModel>>(
      this.getUrl(`/${problemId}/solutions`),
      dto
    );
  }

  /**
   * Get all solutions for a problem
   */
  getSolutions(problemId: string): Observable<ApiResponse<SolutionsModel[]>> {
    return this.apiService.get<ApiResponse<SolutionsModel[]>>(
      this.getUrl(`/${problemId}/solutions`)
    );
  }

  getMySolutions(problemId: string): Observable<ApiResponse<SolutionsModel[]>> {
    return this.apiService.get<ApiResponse<SolutionsModel[]>>(
      this.getUrl(`/${problemId}/solutions/me`)
    );
  }

  /**
   * Get a specific solution by ID
   */
  getSolution(problemId: string, solutionId: string): Observable<ApiResponse<SolutionsModel>> {
    return this.apiService.get<ApiResponse<SolutionsModel>>(
      this.getUrl(`/${problemId}/solutions/${solutionId}`)
    );
  }

  /**
   * Update a solution (owner only)
   */
  updateSolution(
    problemId: string,
    solutionId: string,
    dto: UpdateSolutionDto
  ): Observable<ApiResponse<SolutionsModel>> {
    return this.apiService.patch<ApiResponse<SolutionsModel>>(
      this.getUrl(`/${problemId}/solutions/${solutionId}`),
      dto
    );
  }

  /**
   * Delete a solution (owner only)
   */
  deleteSolution(problemId: string, solutionId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${problemId}/solutions/${solutionId}`)
    );
  }

  // ==================== AI Features ====================

  getAiHints(problemId: string, lang: 'vi' | 'en' = 'vi'): Observable<ApiResponse<any[]>> {
    return this.apiService.get<ApiResponse<any[]>>(`/ai/problems/${problemId}/hints`, {
      lang,
    });
  }

  getAlgorithmSuggestion(
    problemId: string,
    body: {
      code?: string;
      language?: string;
      lang?: 'vi' | 'en';
      provider?: AiProviderEnum;
    } = {},
  ): Observable<ApiResponse<any>> {
    const provider = body.provider ?? this.getPreferredAiProvider();
    return this.apiService.post<ApiResponse<any>>(
      `/ai/problems/${problemId}/algorithm-suggestion`,
      { ...body, provider },
    );
  }

  getAiCodeReview(submissionId: string): Observable<ApiResponse<any>> {
    return this.apiService.get<ApiResponse<any>>(`/ai/submissions/${submissionId}/review`);
  }

  getAiErrorExplanation(
    submissionId: string,
    lang: 'vi' | 'en' = 'vi',
  ): Observable<ApiResponse<any>> {
    const provider = this.getPreferredAiProvider();
    return this.apiService.post<ApiResponse<any>>(
      `/ai/submissions/${submissionId}/error-explanation`,
      { lang, provider },
    );
  }

  getAiDebugAssist(
    submissionId: string,
    lang: 'vi' | 'en' = 'vi',
  ): Observable<ApiResponse<any>> {
    const provider = this.getPreferredAiProvider();
    return this.apiService.post<ApiResponse<any>>(
      `/ai/submissions/${submissionId}/debug-assist`,
      { lang, provider },
    );
  }

  getAiExplainSolution(
    submissionId: string,
    lang: 'vi' | 'en' = 'vi',
    detail: 'brief' | 'detailed' = 'detailed',
  ): Observable<ApiResponse<any>> {
    const provider = this.getPreferredAiProvider();
    return this.apiService.post<ApiResponse<any>>(
      `/ai/submissions/${submissionId}/explain-solution`,
      { lang, detail, provider },
    );
  }

  getAiOptimizationSuggestions(
    submissionId: string,
    lang: 'vi' | 'en' = 'vi',
  ): Observable<ApiResponse<any>> {
    const provider = this.getPreferredAiProvider();
    return this.apiService.post<ApiResponse<any>>(
      `/ai/submissions/${submissionId}/optimize-suggestions`,
      { lang, provider },
    );
  }

  translateCode(
    sourceCode: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Observable<ApiResponse<any>> {
    const provider = this.getPreferredAiProvider();
    return this.apiService.post<ApiResponse<any>>('/ai/code/translate', {
      sourceCode,
      sourceLanguage,
      targetLanguage,
      provider,
    });
  }

  getRecommendedProblems(limit: number = 10): Observable<ApiResponse<any[]>> {
    return this.apiService.get<ApiResponse<any[]>>('/ai/users/me/recommended-problems', {
      limit,
    });
  }

  getLearningPaths(): Observable<ApiResponse<any[]>> {
    return this.apiService.get<ApiResponse<any[]>>('/ai/learning-paths');
  }

  getActiveLearningPath(): Observable<ApiResponse<any>> {
    return this.apiService.get<ApiResponse<any>>('/ai/learning-paths/active');
  }

  generateLearningPath(goalTopic: string, targetLevel: string): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>('/ai/learning-paths/generate', {
      goalTopic,
      targetLevel,
    });
  }

  completeLearningPathStep(pathId: string, stepIndex: number): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(
      `/ai/learning-paths/${pathId}/steps/${stepIndex}/complete`,
      {},
    );
  }

  generateCourseAnalytics(
    courseId: string,
    periodStart: string,
    periodEnd: string,
  ): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(
      `/ai/courses/${courseId}/analytics/generate`,
      { periodStart, periodEnd },
    );
  }

  getLatestCourseAnalytics(courseId: string): Observable<ApiResponse<any>> {
    return this.apiService.get<ApiResponse<any>>(`/ai/courses/${courseId}/analytics/latest`);
  }

  gradeSubmissionAi(
    submissionId: string,
    rubric?: Array<{ criterion: string; criterionVi?: string; maxScore: number }>,
  ): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(`/ai/submissions/${submissionId}/grade`, {
      rubric,
    });
  }

  getSubmissionAiGrading(submissionId: string): Observable<ApiResponse<any>> {
    return this.apiService.get<ApiResponse<any>>(`/ai/submissions/${submissionId}/grading`);
  }

  runPlagiarismCheck(
    submissionId: string,
    threshold: number = 0.75,
  ): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(
      `/ai/submissions/${submissionId}/plagiarism-check`,
      { threshold },
    );
  }

  getPlagiarismReport(submissionId: string): Observable<ApiResponse<any>> {
    return this.apiService.get<ApiResponse<any>>(`/ai/submissions/${submissionId}/plagiarism-report`);
  }

  generateProblemDraftAi(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    constraints?: string,
    lang: 'vi' | 'en' = 'vi',
  ): Observable<ApiResponse<any>> {
    const provider = this.getPreferredAiProvider();
    return this.apiService.post<ApiResponse<any>>('/ai/problems/generate', {
      topic,
      difficulty,
      constraints,
      lang,
      provider,
    });
  }

  generateAiTestcases(
    problemId: string,
    payload: {
      includeEdgeCases?: boolean;
      includeCornerCases?: boolean;
      includePerformance?: boolean;
      count?: number;
    } = {},
  ): Observable<ApiResponse<any[]>> {
    return this.apiService.post<ApiResponse<any[]>>(
      `/ai/problems/${problemId}/testcases/generate`,
      payload,
    );
  }

  getAiTestcases(problemId: string, approvedOnly = false): Observable<ApiResponse<any[]>> {
    return this.apiService.get<ApiResponse<any[]>>(
      `/ai/problems/${problemId}/testcases`,
      { approvedOnly },
    );
  }
}
