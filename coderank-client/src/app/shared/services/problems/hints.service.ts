import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, CreateHintDto, HintsModel, ProblemsApi, UpdateHintDto } from '../../../data';

/**
 * Hints Service - CRUD operations for hints
 */
@Injectable({
  providedIn: 'root'
})
export class HintsService {
  private readonly problemsApi = inject(ProblemsApi);

  /*
   * Get all hints for a problem
   */
  getHints(problemId: string): Observable<ApiResponse<HintsModel[]>> {
    return this.problemsApi.getHints(problemId);
  }

  /**
   * Get a specific hint by ID
   */
  getHint(problemId: string, hintId: string): Observable<ApiResponse<HintsModel>> {
    return this.problemsApi.getHint(problemId, hintId);
  }

  /**
   * Create a new hint for a problem
   */
  createHint(problemId: string, dto: CreateHintDto): Observable<ApiResponse<HintsModel>> {
    return this.problemsApi.createHint(problemId, dto);
  }

  /**
   * Update a hint
   */
  updateHint(problemId: string, hintId: string, dto: UpdateHintDto): Observable<ApiResponse<HintsModel>> {
    return this.problemsApi.updateHint(problemId, hintId, dto);
  }

  /**
   * Delete a hint
   */
  deleteHint(problemId: string, hintId: string): Observable<ApiResponse<void>> {
    return this.problemsApi.deleteHint(problemId, hintId);
  }
}
