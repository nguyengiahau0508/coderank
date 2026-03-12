import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data';
import { ApiResponse } from '../../../../data';
import { HintsModel } from '../../../../data';

/**
 * Hints Service - Operations for hints
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
