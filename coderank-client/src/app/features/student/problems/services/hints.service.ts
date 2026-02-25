import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data/api/problems.api';
import { ApiResponse } from '../../../../data/interfaces';
import { HintsModel } from '../../../../data/models/hints.model';

/**
 * Student Hints Service - Read-only operations for hints
 */
@Injectable({
  providedIn: 'root'
})
export class HintsService {
  private readonly problemsApi = inject(ProblemsApi);

  /**
   * Get all hints for a problem
   */
  getHints(problemId: string): Observable<ApiResponse<HintsModel[]>> {
    return this.problemsApi.getHints(problemId);
  }
}
