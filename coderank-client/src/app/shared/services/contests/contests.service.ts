import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddProblemToContestDto, ApiResponse, ContestParticipantsModel, ContestProblemsModel, ContestsApi, ContestsModel, ContestStatusEnum, ContestSubmissionsModel, CreateContestDto, PaginatedResponse, PaginationQueryContestsDto, SubmissionStatusEnum, UpdateContestDto, UpdateContestProblemDto } from '../../../data';

@Injectable({
  providedIn: 'root',
})
export class ContestsService {
  private readonly contestsApi = inject(ContestsApi);

  // ==================== Contest CRUD ====================

  getContests(params?:PaginationQueryContestsDto): Observable<PaginatedResponse<ContestsModel>> {
    return this.contestsApi.getContests(params);
  }

  getContest(contestId: string): Observable<ApiResponse<ContestsModel>> {
    return this.contestsApi.getContest(contestId);
  }

  createContest(dto: CreateContestDto): Observable<ApiResponse<ContestsModel>> {
    return this.contestsApi.createContest(dto);
  }

  updateContest(contestId: string, dto: UpdateContestDto): Observable<ApiResponse<ContestsModel>> {
    return this.contestsApi.updateContest(contestId, dto);
  }

  deleteContest(contestId: string): Observable<ApiResponse<void>> {
    return this.contestsApi.deleteContest(contestId);
  }

  // ==================== Contest Problems ====================

  getContestProblems(contestId: string): Observable<ApiResponse<ContestProblemsModel[]>> {
    return this.contestsApi.getContestProblems(contestId);
  }

  addProblemToContest(contestId: string, dto: AddProblemToContestDto): Observable<ApiResponse<ContestProblemsModel>> {
    return this.contestsApi.addProblemToContest(contestId, dto);
  }

  updateContestProblem(contestId: string, problemId: string, dto: UpdateContestProblemDto): Observable<ApiResponse<ContestProblemsModel>> {
    return this.contestsApi.updateContestProblem(contestId, problemId, dto);
  }

  removeProblemFromContest(contestId: string, problemId: string): Observable<ApiResponse<void>> {
    return this.contestsApi.removeProblemFromContest(contestId, problemId);
  }

  // ==================== Participants ====================

  getContestParticipants(contestId: string): Observable<ApiResponse<ContestParticipantsModel[]>> {
    return this.contestsApi.getContestParticipants(contestId);
  }

  getContestLeaderboard(contestId: string): Observable<ApiResponse<ContestParticipantsModel[]>> {
    return this.contestsApi.getContestLeaderboard(contestId);
  }

  removeParticipant(contestId: string, userId: string): Observable<ApiResponse<void>> {
    return this.contestsApi.removeParticipant(contestId, userId);
  }

  // ==================== Submissions ====================

  getAllContestSubmissions(contestId: string): Observable<ApiResponse<ContestSubmissionsModel[]>> {
    return this.contestsApi.getAllContestSubmissions(contestId);
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
