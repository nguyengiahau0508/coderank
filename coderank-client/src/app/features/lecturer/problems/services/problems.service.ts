import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data';
import { ApiResponse, PaginatedResponse } from '../../../../data';
import { ProblemsModel } from '../../../../data';
import {
  PaginationQueryParams,
  CreateProblemDto,
  UpdateProblemDto,
} from '../../../../data';

/**
 * Problems Service - CRUD operations for problems
 */
@Injectable({
  providedIn: 'root'
})
export class ProblemsService {
  private readonly problemsApi = inject(ProblemsApi);

  /**
   * Get paginated problems list with filters
   */
  getProblems(params?: PaginationQueryParams): Observable<PaginatedResponse<ProblemsModel>> {
    return this.problemsApi.getProblems(params);
  }

  /**
   * Get my problems
   */
  getMyProblems(params?: PaginationQueryParams): Observable<PaginatedResponse<ProblemsModel>> {
    return this.problemsApi.getMyProblems(params);
  }

  /**
   * Get single problem details
   */
  getProblem(problemId: string): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.getProblem(problemId);
  }

  /**
   * Create a new problem
   */
  createProblem(dto: CreateProblemDto): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.createProblem(dto);
  }

  /**
   * Update a problem
   */
  updateProblem(problemId: string, dto: UpdateProblemDto): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.updateProblem(problemId, dto);
  }

  /**
   * Delete a problem
   */
  deleteProblem(problemId: string): Observable<ApiResponse<void>> {
    return this.problemsApi.deleteProblem(problemId);
  }

  generateCourseAnalytics(
    courseId: string,
    periodStart?: string,
    periodEnd?: string,
  ): Observable<ApiResponse<any>> {
    return this.problemsApi.generateCourseAnalytics(
      courseId,
      periodStart ?? '',
      periodEnd ?? '',
    );
  }

  getLatestCourseAnalytics(courseId: string): Observable<ApiResponse<any>> {
    return this.problemsApi.getLatestCourseAnalytics(courseId);
  }

  gradeSubmissionAi(
    submissionId: string,
    rubric?: Array<{ criterion: string; criterionVi?: string; maxScore: number }>,
  ): Observable<ApiResponse<any>> {
    return this.problemsApi.gradeSubmissionAi(submissionId, rubric);
  }

  getSubmissionAiGrading(submissionId: string): Observable<ApiResponse<any>> {
    return this.problemsApi.getSubmissionAiGrading(submissionId);
  }

  runPlagiarismCheck(submissionId: string, threshold: number): Observable<ApiResponse<any>> {
    return this.problemsApi.runPlagiarismCheck(submissionId, threshold);
  }

  getPlagiarismReport(submissionId: string): Observable<ApiResponse<any>> {
    return this.problemsApi.getPlagiarismReport(submissionId);
  }

  generateProblemDraftAi(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    constraints?: string,
    lang: 'vi' | 'en' = 'vi',
  ): Observable<ApiResponse<any>> {
    return this.problemsApi.generateProblemDraftAi(topic, difficulty, constraints, lang);
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
    return this.problemsApi.generateAiTestcases(problemId, payload);
  }
}
