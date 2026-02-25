import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data/api/problems.api';
import { ApiResponse } from '../../../../data/interfaces';
import { SolutionsModel } from '../../../../data/models/solutions.model';
import { CreateSolutionDto, UpdateSolutionDto } from '../../../../data/dto/problems';

/**
 * Student Solutions Service - View and share solutions
 */
@Injectable({
  providedIn: 'root'
})
export class SolutionsService {
  private readonly problemsApi = inject(ProblemsApi);

  /**
   * Get all solutions for a problem
   */
  getSolutions(problemId: string): Observable<ApiResponse<SolutionsModel[]>> {
    return this.problemsApi.getSolutions(problemId);
  }

  /**
   * Get my solutions for a problem
   */
  getMySolutions(problemId: string): Observable<ApiResponse<SolutionsModel[]>> {
    return this.problemsApi.getMySolutions(problemId);
  }

  /**
   * Get a specific solution
   */
  getSolution(problemId: string, solutionId: string): Observable<ApiResponse<SolutionsModel>> {
    return this.problemsApi.getSolution(problemId, solutionId);
  }

  /**
   * Create a new solution (requires Accepted submission)
   */
  createSolution(problemId: string, dto: CreateSolutionDto): Observable<ApiResponse<SolutionsModel>> {
    return this.problemsApi.createSolution(problemId, dto);
  }

  /**
   * Update a solution (owner only)
   */
  updateSolution(problemId: string, solutionId: string, dto: UpdateSolutionDto): Observable<ApiResponse<SolutionsModel>> {
    return this.problemsApi.updateSolution(problemId, solutionId, dto);
  }

  /**
   * Delete a solution (owner only)
   */
  deleteSolution(problemId: string, solutionId: string): Observable<ApiResponse<void>> {
    return this.problemsApi.deleteSolution(problemId, solutionId);
  }
}
