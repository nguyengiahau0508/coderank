import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../data/api/problems.api';
import { ApiResponse, PaginatedResponse } from '../../../data/interfaces';
import { ProblemsModel } from '../../../data/models/problems.model';
import { TestcasesModel } from '../../../data/models/testcases.model';
import { HintsModel } from '../../../data/models/hints.model';
import { SubmissionsModel } from '../../../data/models/submissions.model';
import { PaginationQueryParams, CreateSubmissionDto } from '../../../data/dto/problems';

/**
 * Problems Service - Business logic for student-facing problems features
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
   * Get single problem details
   */
  getProblemById(problemId: string): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.getProblem(problemId);
  }

  /**
   * Get sample testcases for a problem
   */
  getSampleTestcases(problemId: string): Observable<ApiResponse<TestcasesModel[]>> {
    return this.problemsApi.getTestcases(problemId);
  }

  /**
   * Get hints for a problem
   */
  getHints(problemId: string): Observable<ApiResponse<HintsModel[]>> {
    return this.problemsApi.getHints(problemId);
  }

  /**
   * Submit solution
   */
  submitSolution(problemId: string, dto: CreateSubmissionDto): Observable<ApiResponse<SubmissionsModel>> {
    return this.problemsApi.submitSolution(problemId, dto);
  }

  /**
   * Get submission history for a problem
   */
  getSubmissionHistory(problemId: string): Observable<ApiResponse<SubmissionsModel[]>> {
    return this.problemsApi.getSubmissions(problemId);
  }
}
