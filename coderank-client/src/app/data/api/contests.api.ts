import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from './base.api';
import { ApiResponse, PaginatedResponse } from '../interfaces';

// TODO: Create proper models and DTOs for contests
export interface Contest {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContestDto {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface UpdateContestDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface PaginationQueryContestsDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AddProblemToContestDto {
  problemId: string;
  order?: number;
  points?: number;
}

export interface UpdateContestProblemDto {
  order?: number;
  points?: number;
}

export interface JoinContestDto {
  // Add fields if needed
}

export interface CreateContestSubmissionDto {
  problemId: string;
  code: string;
  language: string;
}

/**
 * Contests API Service
 * Handles all contest-related API calls including participants, problems, and submissions
 */
@Injectable({
  providedIn: 'root'
})
export class ContestsApi extends BaseApi {
  protected readonly endpoint = '/contests';

  // ==================== Contest Management ====================

  /**
   * Create a new contest (Admin/Instructor only)
   */
  createContest(dto: CreateContestDto): Observable<ApiResponse<Contest>> {
    return this.apiService.post<ApiResponse<Contest>>(this.endpoint, dto);
  }

  /**
   * Get a single contest by ID
   */
  getContest(contestId: string): Observable<ApiResponse<Contest>> {
    return this.apiService.get<ApiResponse<Contest>>(
      this.getUrl(`/${contestId}`)
    );
  }

  /**
   * Get paginated list of contests with filters
   */
  getContests(params?: PaginationQueryContestsDto): Observable<PaginatedResponse<Contest>> {
    return this.apiService.get<PaginatedResponse<Contest>>(
      this.endpoint,
      this.buildParams(params)
    );
  }

  /**
   * Update a contest (Admin/Instructor/Owner only)
   */
  updateContest(contestId: string, dto: UpdateContestDto): Observable<ApiResponse<Contest>> {
    return this.apiService.patch<ApiResponse<Contest>>(
      this.getUrl(`/${contestId}`),
      dto
    );
  }

  /**
   * Delete a contest (Admin/Instructor/Owner only)
   */
  deleteContest(contestId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${contestId}`)
    );
  }

  // ==================== Contest Problems ====================

  /**
   * Add a problem to contest
   */
  addProblemToContest(contestId: string, dto: AddProblemToContestDto): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(
      this.getUrl(`/${contestId}/problems`),
      dto
    );
  }

  /**
   * Get all problems in a contest
   */
  getContestProblems(contestId: string): Observable<ApiResponse<any[]>> {
    return this.apiService.get<ApiResponse<any[]>>(
      this.getUrl(`/${contestId}/problems`)
    );
  }

  /**
   * Update contest problem (order, points)
   */
  updateContestProblem(
    contestId: string,
    problemId: string,
    dto: UpdateContestProblemDto
  ): Observable<ApiResponse<any>> {
    return this.apiService.patch<ApiResponse<any>>(
      this.getUrl(`/${contestId}/problems/${problemId}`),
      dto
    );
  }

  /**
   * Remove a problem from contest
   */
  removeProblemFromContest(contestId: string, problemId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${contestId}/problems/${problemId}`)
    );
  }

  // ==================== Contest Participants ====================

  /**
   * Join a contest
   */
  joinContest(contestId: string, dto?: JoinContestDto): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(
      this.getUrl(`/${contestId}/participants`),
      dto || {}
    );
  }

  /**
   * Get contest participants
   */
  getContestParticipants(contestId: string): Observable<ApiResponse<any[]>> {
    return this.apiService.get<ApiResponse<any[]>>(
      this.getUrl(`/${contestId}/participants`)
    );
  }

  /**
   * Leave a contest
   */
  leaveContest(contestId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${contestId}/participants/me`)
    );
  }

  // ==================== Contest Submissions ====================

  /**
   * Submit solution for contest problem
   */
  submitContestSolution(
    contestId: string,
    dto: CreateContestSubmissionDto
  ): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(
      this.getUrl(`/${contestId}/submissions`),
      dto
    );
  }

  /**
   * Get submissions for contest (current user)
   */
  getMyContestSubmissions(contestId: string): Observable<ApiResponse<any[]>> {
    return this.apiService.get<ApiResponse<any[]>>(
      this.getUrl(`/${contestId}/submissions/me`)
    );
  }

  /**
   * Get contest leaderboard
   */
  getContestLeaderboard(contestId: string): Observable<ApiResponse<any[]>> {
    return this.apiService.get<ApiResponse<any[]>>(
      this.getUrl(`/${contestId}/leaderboard`)
    );
  }
}
