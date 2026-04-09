import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data';
import { ApiResponse, PaginatedResponse } from '../../../../data';
import { ProblemsModel } from '../../../../data';
import { PaginationQueryParams } from '../../../../data';

/**
 * Student Problems Service - Read-only operations for problems
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
  getProblem(problemId: string): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.getProblem(problemId);
  }

  getRecommendedProblems(limit: number = 6): Observable<ApiResponse<ProblemsModel[]>> {
    return this.problemsApi.getRecommendedProblems(limit);
  }

  getActiveLearningPath(): Observable<ApiResponse<any>> {
    return this.problemsApi.getActiveLearningPath();
  }
}
