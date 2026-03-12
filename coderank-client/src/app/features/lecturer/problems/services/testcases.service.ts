import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data';
import { ApiResponse } from '../../../../data';
import { TestcasesModel } from '../../../../data';

/**
 * Testcases Service - Operations for testcases
 */
@Injectable({
  providedIn: 'root'
})
export class TestcasesService {
  private readonly problemsApi = inject(ProblemsApi);

  /**
   * Get sample testcases for a problem
   */
  getSampleTestcases(problemId: string): Observable<ApiResponse<TestcasesModel[]>> {
    return this.problemsApi.getSampleTestcases(problemId);
  }
}
