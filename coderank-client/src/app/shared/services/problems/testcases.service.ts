import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, CreateTestcaseDto, ProblemsApi, TestcasesModel, UpdateTestcaseDto } from '../../../data';

/**
 * Testcases Service - CRUD operations for testcases
 */
@Injectable({
  providedIn: 'root'
})
export class TestcasesService {
  private readonly problemsApi = inject(ProblemsApi);

  /**
   * Get all testcases for a problem
   */
  getTestcases(problemId: string): Observable<ApiResponse<TestcasesModel[]>> {
    return this.problemsApi.getTestcases(problemId);
  }

  /**
   * Get sample testcases for a problem
   */
  getSampleTestcases(problemId: string): Observable<ApiResponse<TestcasesModel[]>> {
    return this.problemsApi.getSampleTestcases(problemId);
  }

  /**
   * Get a specific testcase by ID
   */
  getTestcase(problemId: string, testcaseId: string): Observable<ApiResponse<TestcasesModel>> {
    return this.problemsApi.getTestcase(problemId, testcaseId);
  }

  /**
   * Create a new testcase for a problem
   */
  createTestcase(problemId: string, dto: CreateTestcaseDto): Observable<ApiResponse<TestcasesModel>> {
    return this.problemsApi.createTestcase(problemId, dto);
  }

  /**
   * Update a testcase
   */
  updateTestcase(problemId: string, testcaseId: string, dto: UpdateTestcaseDto): Observable<ApiResponse<TestcasesModel>> {
    return this.problemsApi.updateTestcase(problemId, testcaseId, dto);
  }

  /**
   * Delete a testcase
   */
  deleteTestcase(problemId: string, testcaseId: string): Observable<ApiResponse<void>> {
    return this.problemsApi.deleteTestcase(problemId, testcaseId);
  }
}
