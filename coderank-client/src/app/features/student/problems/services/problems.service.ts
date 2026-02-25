import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data/api/problems.api';
import { ApiResponse, PaginatedResponse } from '../../../../data/interfaces';
import { ProblemsModel } from '../../../../data/models/problems.model';
import { PaginationQueryParams } from '../../../../data/dto/problems';

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
   * Get single problem details
   */
  getProblem(problemId: string): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.getProblem(problemId);
  }
}
