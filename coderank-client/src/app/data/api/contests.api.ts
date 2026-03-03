import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from './base.api';
import { ApiResponse, PaginatedResponse } from '../interfaces';
import {
  ContestsModel,
  ContestProblemsModel,
  ContestParticipantsModel,
  ContestSubmissionsModel,
} from '../models/contests.model';
import {
  CreateContestDto,
  UpdateContestDto,
  PaginationQueryContestsDto,
  AddProblemToContestDto,
  UpdateContestProblemDto,
  JoinContestDto,
  CreateContestSubmissionDto,
} from '../dto/contests';

/**
 * Contests API Service
 * Handles all contest-related API calls including participants, problems, and submissions
 */
@Injectable({
  providedIn: 'root',
})
export class ContestsApi extends BaseApi {
  protected readonly endpoint = '/contests';

  // ==================== Contest Management ====================

  createContest(dto: CreateContestDto): Observable<ApiResponse<ContestsModel>> {
    return this.apiService.post<ApiResponse<ContestsModel>>(this.endpoint, dto);
  }

  getContest(contestId: string): Observable<ApiResponse<ContestsModel>> {
    return this.apiService.get<ApiResponse<ContestsModel>>(
      this.getUrl(`/${contestId}`)
    );
  }

  getContests(params?: PaginationQueryContestsDto): Observable<PaginatedResponse<ContestsModel>> {
    return this.apiService.get<PaginatedResponse<ContestsModel>>(
      this.endpoint,
      this.buildParams(params)
    );
  }

  updateContest(contestId: string, dto: UpdateContestDto): Observable<ApiResponse<ContestsModel>> {
    return this.apiService.patch<ApiResponse<ContestsModel>>(
      this.getUrl(`/${contestId}`),
      dto
    );
  }

  deleteContest(contestId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${contestId}`)
    );
  }

  // ==================== Contest Problems ====================

  addProblemToContest(contestId: string, dto: AddProblemToContestDto): Observable<ApiResponse<ContestProblemsModel>> {
    return this.apiService.post<ApiResponse<ContestProblemsModel>>(
      this.getUrl(`/${contestId}/problems`),
      dto
    );
  }

  getContestProblems(contestId: string): Observable<ApiResponse<ContestProblemsModel[]>> {
    return this.apiService.get<ApiResponse<ContestProblemsModel[]>>(
      this.getUrl(`/${contestId}/problems`)
    );
  }

  getContestProblem(contestId: string, problemId: string): Observable<ApiResponse<ContestProblemsModel>> {
    return this.apiService.get<ApiResponse<ContestProblemsModel>>(
      this.getUrl(`/${contestId}/problems/${problemId}`)
    );
  }

  updateContestProblem(
    contestId: string,
    problemId: string,
    dto: UpdateContestProblemDto
  ): Observable<ApiResponse<ContestProblemsModel>> {
    return this.apiService.patch<ApiResponse<ContestProblemsModel>>(
      this.getUrl(`/${contestId}/problems/${problemId}`),
      dto
    );
  }

  removeProblemFromContest(contestId: string, problemId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${contestId}/problems/${problemId}`)
    );
  }

  // ==================== Contest Participants ====================

  joinContest(contestId: string, dto?: JoinContestDto): Observable<ApiResponse<ContestParticipantsModel>> {
    return this.apiService.post<ApiResponse<ContestParticipantsModel>>(
      this.getUrl(`/${contestId}/join`),
      dto || {}
    );
  }

  getContestParticipants(contestId: string): Observable<ApiResponse<ContestParticipantsModel[]>> {
    return this.apiService.get<ApiResponse<ContestParticipantsModel[]>>(
      this.getUrl(`/${contestId}/participants`)
    );
  }

  getContestLeaderboard(contestId: string): Observable<ApiResponse<ContestParticipantsModel[]>> {
    return this.apiService.get<ApiResponse<ContestParticipantsModel[]>>(
      this.getUrl(`/${contestId}/leaderboard`)
    );
  }

  removeParticipant(contestId: string, userId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${contestId}/participants/${userId}`)
    );
  }

  leaveContest(contestId: string): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(
      this.getUrl(`/${contestId}/leave`),
      {}
    );
  }

  // ==================== Contest Submissions ====================

  submitContestSolution(
    contestId: string,
    problemId: string,
    dto: CreateContestSubmissionDto
  ): Observable<ApiResponse<ContestSubmissionsModel>> {
    return this.apiService.post<ApiResponse<ContestSubmissionsModel>>(
      this.getUrl(`/${contestId}/problems/${problemId}/submit`),
      dto
    );
  }

  getMyContestSubmissions(contestId: string): Observable<ApiResponse<ContestSubmissionsModel[]>> {
    return this.apiService.get<ApiResponse<ContestSubmissionsModel[]>>(
      this.getUrl(`/${contestId}/submissions`)
    );
  }

  getMyProblemSubmissions(contestId: string, problemId: string): Observable<ApiResponse<ContestSubmissionsModel[]>> {
    return this.apiService.get<ApiResponse<ContestSubmissionsModel[]>>(
      this.getUrl(`/${contestId}/problems/${problemId}/submissions`)
    );
  }

  getContestSubmissionDetail(contestId: string, submissionId: string): Observable<ApiResponse<ContestSubmissionsModel>> {
    return this.apiService.get<ApiResponse<ContestSubmissionsModel>>(
      this.getUrl(`/${contestId}/submissions/${submissionId}`)
    );
  }

  getAllContestSubmissions(contestId: string): Observable<ApiResponse<ContestSubmissionsModel[]>> {
    return this.apiService.get<ApiResponse<ContestSubmissionsModel[]>>(
      this.getUrl(`/${contestId}/all-submissions`)
    );
  }
}
