import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Paginator } from 'primeng/paginator';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services & Models
import { ContestsModel } from '../../../../data';
import { ContestStatusEnum } from '../../../../data';
import { StudentContestsService } from '../services/contests.service';

@Component({
  selector: 'app-student-contest-list',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    InputText,
    Select,
    Paginator,
    IconField,
    InputIcon,
    Toast,
  ],
  providers: [MessageService],
  templateUrl: './contest-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentContestListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contestsService = inject(StudentContestsService);
  private readonly messageService = inject(MessageService);

  // State
  readonly contests = signal<ContestsModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);

  // Filters
  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<ContestStatusEnum | null>(null);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(12);

  readonly statusOptions = [
    { label: 'Sắp diễn ra', value: ContestStatusEnum.Upcoming },
    { label: 'Đang diễn ra', value: ContestStatusEnum.Running },
    { label: 'Đã kết thúc', value: ContestStatusEnum.Ended },
  ];

  readonly hasFilters = computed(() =>
    !!this.searchTerm() || !!this.selectedStatus()
  );

  ngOnInit(): void {
    this.loadContests();
  }

  loadContests(): void {
    this.loading.set(true);

    const params: any = {
      page: this.page(),
      limit: this.limit(),
      isPublic: true,
    };

    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.selectedStatus()) params.status = this.selectedStatus();

    this.contestsService.getContests(params).subscribe({
      next: (response) => {
        this.contests.set(response.data || []);
        this.totalRecords.set(response.meta?.totalItems ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách cuộc thi' });
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: any): void {
    this.page.set(event.page + 1);
    this.limit.set(event.rows);
    this.loadContests();
  }

  onSearch(): void {
    this.page.set(1);
    this.loadContests();
  }

  onStatusChange(): void {
    this.page.set(1);
    this.loadContests();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set(null);
    this.page.set(1);
    this.loadContests();
  }

  viewContest(contest: ContestsModel): void {
    this.router.navigate([contest.id], { relativeTo: this.route });
  }

  getStatusSeverity(status: ContestStatusEnum): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return this.contestsService.getStatusSeverity(status);
  }

  getStatusLabel(status: ContestStatusEnum): string {
    return this.contestsService.getStatusLabel(status);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  getTimeInfo(contest: ContestsModel): string {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (contest.status === ContestStatusEnum.Running) {
      const remaining = end.getTime() - now.getTime();
      if (remaining > 0) {
        const hours = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        return `Còn ${hours}h ${mins}m`;
      }
    }

    if (contest.status === ContestStatusEnum.Upcoming) {
      const until = start.getTime() - now.getTime();
      if (until > 0) {
        const days = Math.floor(until / 86400000);
        if (days > 0) return `Còn ${days} ngày`;
        const hours = Math.floor(until / 3600000);
        return `Còn ${hours}h`;
      }
    }

    return '';
  }
}
