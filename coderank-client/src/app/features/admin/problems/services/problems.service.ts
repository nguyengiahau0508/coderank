import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data/api/problems.api';
import { ApiResponse, PaginatedResponse } from '../../../../data/interfaces';
import { ProblemsModel } from '../../../../data/models/problems.model';
import {
  PaginationQueryParams,
  CreateProblemDto,
  UpdateProblemDto,
} from '../../../../data/dto/problems';

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
}
