import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContestsApi } from '../../../../data';
import { ApiResponse, PaginatedResponse } from '../../../../data';
import {
  ContestsModel,
  ContestProblemsModel,
  ContestParticipantsModel,
  ContestSubmissionsModel,
} from '../../../../data';
import {
  PaginationQueryContestsDto,
  JoinContestDto,
  CreateContestSubmissionDto,
} from '../../../../data';
import { ContestStatusEnum, SubmissionStatusEnum } from '../../../../data';

@Injectable({
  providedIn: 'root',
})
export class StudentContestsService {
  private readonly contestsApi = inject(ContestsApi);

  getContests(params?: PaginationQueryContestsDto): Observable<PaginatedResponse<ContestsModel>> {
    return this.contestsApi.getContests(params);
  }

  getContest(contestId: string): Observable<ApiResponse<ContestsModel>> {
    return this.contestsApi.getContest(contestId);
  }

  getContestProblems(contestId: string): Observable<ApiResponse<ContestProblemsModel[]>> {
    return this.contestsApi.getContestProblems(contestId);
  }

  getContestProblem(contestId: string, problemId: string): Observable<ApiResponse<ContestProblemsModel>> {
    return this.contestsApi.getContestProblem(contestId, problemId);
  }

  joinContest(contestId: string, dto?: JoinContestDto): Observable<ApiResponse<ContestParticipantsModel>> {
    return this.contestsApi.joinContest(contestId, dto);
  }

  leaveContest(contestId: string): Observable<ApiResponse<any>> {
    return this.contestsApi.leaveContest(contestId);
  }

  getLeaderboard(contestId: string): Observable<ApiResponse<ContestParticipantsModel[]>> {
    return this.contestsApi.getContestLeaderboard(contestId);
  }

  getParticipants(contestId: string): Observable<ApiResponse<ContestParticipantsModel[]>> {
    return this.contestsApi.getContestParticipants(contestId);
  }

  getMyParticipation(contestId: string): Observable<ApiResponse<ContestParticipantsModel | null>> {
    return this.contestsApi.getMyContestParticipation(contestId);
  }

  submitSolution(contestId: string, problemId: string, dto: CreateContestSubmissionDto): Observable<ApiResponse<ContestSubmissionsModel>> {
    return this.contestsApi.submitContestSolution(contestId, problemId, dto);
  }

  getMySubmissions(contestId: string): Observable<ApiResponse<ContestSubmissionsModel[]>> {
    return this.contestsApi.getMyContestSubmissions(contestId);
  }

  getMyProblemSubmissions(contestId: string, problemId: string): Observable<ApiResponse<ContestSubmissionsModel[]>> {
    return this.contestsApi.getMyProblemSubmissions(contestId, problemId);
  }

  // ==================== Helpers ====================

  getStatusSeverity(status: ContestStatusEnum): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case ContestStatusEnum.Running: return 'success';
      case ContestStatusEnum.Upcoming: return 'info';
      case ContestStatusEnum.Draft: return 'warn';
      case ContestStatusEnum.Ended: return 'secondary';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: ContestStatusEnum): string {
    const labels: Record<ContestStatusEnum, string> = {
      [ContestStatusEnum.Draft]: 'Nháp',
      [ContestStatusEnum.Upcoming]: 'Sắp diễn ra',
      [ContestStatusEnum.Running]: 'Đang diễn ra',
      [ContestStatusEnum.Ended]: 'Đã kết thúc',
    };
    return labels[status] || status;
  }

  getSubmissionStatusLabel(status: SubmissionStatusEnum): string {
    const labels: Record<SubmissionStatusEnum, string> = {
      [SubmissionStatusEnum.Pending]: 'Đang chờ',
      [SubmissionStatusEnum.Running]: 'Đang chạy',
      [SubmissionStatusEnum.Accepted]: 'Chấp nhận',
      [SubmissionStatusEnum.WrongAnswer]: 'Sai đáp án',
      [SubmissionStatusEnum.TimeLimitExceeded]: 'Quá thời gian',
      [SubmissionStatusEnum.MemoryLimitExceeded]: 'Quá bộ nhớ',
      [SubmissionStatusEnum.RuntimeError]: 'Lỗi runtime',
      [SubmissionStatusEnum.CompilationError]: 'Lỗi biên dịch',
      [SubmissionStatusEnum.SystemError]: 'Lỗi hệ thống',
    };
    return labels[status] || status;
  }

  getSubmissionStatusSeverity(status: SubmissionStatusEnum): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case SubmissionStatusEnum.Accepted: return 'success';
      case SubmissionStatusEnum.Pending:
      case SubmissionStatusEnum.Running: return 'info';
      case SubmissionStatusEnum.WrongAnswer: return 'danger';
      default: return 'warn';
    }
  }
}
