import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data/api/problems.api';
import { ApiResponse, PaginatedResponse } from '../../../../data/interfaces';
import { ProblemsModel } from '../../../../data/models/problems.model';
import { TestcasesModel } from '../../../../data/models/testcases.model';
import { HintsModel } from '../../../../data/models/hints.model';
import {
  CreateProblemDto,
  UpdateProblemDto,
  CreateTestcaseDto,
  UpdateTestcaseDto,
  CreateHintDto,
  UpdateHintDto,
  PaginationQueryParams
} from '../../../../data/dto/problems';

/**
 * Admin Problems Service
 * Handles all problem management operations for Admin/Lecturer roles
 */
@Injectable({
  providedIn: 'root'
})
export class AdminProblemsService {
  private readonly problemsApi = inject(ProblemsApi);

  // ==================== Problems ====================

  getProblems(params?: PaginationQueryParams): Observable<PaginatedResponse<ProblemsModel>> {
    return this.problemsApi.getProblems(params);
  }

  getProblem(problemId: string): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.getProblem(problemId);
  }

  createProblem(dto: CreateProblemDto): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.createProblem(dto);
  }

  updateProblem(problemId: string, dto: UpdateProblemDto): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.updateProblem(problemId, dto);
  }

  deleteProblem(problemId: string): Observable<ApiResponse<void>> {
    return this.problemsApi.deleteProblem(problemId);
  }

  // ==================== Testcases ====================

  getTestcases(problemId: string): Observable<ApiResponse<TestcasesModel[]>> {
    return this.problemsApi.getTestcases(problemId);
  }

  createTestcase(problemId: string, dto: CreateTestcaseDto): Observable<ApiResponse<TestcasesModel>> {
    return this.problemsApi.createTestcase(problemId, dto);
  }

  updateTestcase(
    problemId: string,
    testcaseId: string,
    dto: UpdateTestcaseDto
  ): Observable<ApiResponse<TestcasesModel>> {
    return this.problemsApi.updateTestcase(problemId, testcaseId, dto);
  }

  deleteTestcase(problemId: string, testcaseId: string): Observable<ApiResponse<void>> {
    return this.problemsApi.deleteTestcase(problemId, testcaseId);
  }

  // ==================== Hints ====================

  getHints(problemId: string): Observable<ApiResponse<HintsModel[]>> {
    return this.problemsApi.getHints(problemId);
  }

  createHint(problemId: string, dto: CreateHintDto): Observable<ApiResponse<HintsModel>> {
    return this.problemsApi.createHint(problemId, dto);
  }

  updateHint(
    problemId: string,
    hintId: string,
    dto: UpdateHintDto
  ): Observable<ApiResponse<HintsModel>> {
    return this.problemsApi.updateHint(problemId, hintId, dto);
  }

  deleteHint(problemId: string, hintId: string): Observable<ApiResponse<void>> {
    return this.problemsApi.deleteHint(problemId, hintId);
  }

  // ==================== Tags ====================

  addTag(problemId: string, tagId: string): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.addTag(problemId, tagId);
  }

  removeTag(problemId: string, tagId: string): Observable<ApiResponse<void>> {
    return this.problemsApi.removeTag(problemId, tagId);
  }
}
