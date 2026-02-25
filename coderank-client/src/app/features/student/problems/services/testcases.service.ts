import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data/api/problems.api';
import { ApiResponse } from '../../../../data/interfaces';
import { TestcasesModel } from '../../../../data/models/testcases.model';

/**
 * Student Testcases Service - Read-only operations for sample testcases
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
