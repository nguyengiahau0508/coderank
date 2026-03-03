import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Paginator } from 'primeng/paginator';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Models
import { ContestsModel } from '../../../../data/models/contests.model';
import { ContestStatusEnum } from '../../../../data/enums/enums';
import { LecturerContestsService } from '../services/contests.service';
import { LecturerContestFormDialogComponent } from '../components/contest-form-dialog/contest-form-dialog.component';

@Component({
  selector: 'app-lecturer-contest-list',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    InputText,
    Select,
    Tag,
    Paginator,
    IconField,
    InputIcon,
    Dialog,
    Toast,
    Tooltip,
    ConfirmDialog,
    LecturerContestFormDialogComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './contest-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecturerContestListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contestsService = inject(LecturerContestsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  // State
  readonly contests = signal<ContestsModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);

  // Dialog states
  readonly showContestDialog = signal<boolean>(false);
  readonly editingContest = signal<ContestsModel | null>(null);
  readonly isSubmittingDialog = signal<boolean>(false);

  // Filters
  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<ContestStatusEnum | null>(null);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(10);

  // Options
  readonly statusOptions = [
    { label: 'Nháp', value: ContestStatusEnum.Draft },
    { label: 'Sắp diễn ra', value: ContestStatusEnum.Upcoming },
    { label: 'Đang diễn ra', value: ContestStatusEnum.Running },
    { label: 'Đã kết thúc', value: ContestStatusEnum.Ended },
  ];

  readonly hasFilters = computed(() =>
    !!this.searchTerm() || !!this.selectedStatus()
  );

  readonly stats = computed(() => {
    const total = this.totalRecords();
    const running = this.contests().filter(c => c.status === ContestStatusEnum.Running).length;
    const upcoming = this.contests().filter(c => c.status === ContestStatusEnum.Upcoming).length;
    return [
      { label: 'Tổng cuộc thi', value: total.toString(), icon: 'pi-trophy', color: 'bg-amber-500' },
      { label: 'Đang diễn ra', value: running.toString(), icon: 'pi-play', color: 'bg-green-500' },
      { label: 'Sắp tới', value: upcoming.toString(), icon: 'pi-clock', color: 'bg-blue-500' },
    ];
  });

  ngOnInit(): void {
    this.loadContests();
  }

  loadContests(): void {
    this.loading.set(true);

    const params: any = {
      page: this.page(),
      limit: this.limit(),
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }
    if (this.selectedStatus()) {
      params.status = this.selectedStatus();
    }

    this.contestsService.getContests(params).subscribe({
      next: (response) => {
        this.contests.set(response.data || []);
        this.totalRecords.set(response.meta?.totalItems ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách cuộc thi',
        });
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

  // ==================== CRUD ====================

  createContest(): void {
    this.editingContest.set(null);
    this.showContestDialog.set(true);
  }

  editContest(event: Event, contest: ContestsModel): void {
    event.stopPropagation();
    this.editingContest.set(contest);
    this.showContestDialog.set(true);
  }

  onContestSave(data: any): void {
    this.isSubmittingDialog.set(true);

    if (this.editingContest()) {
      this.contestsService.updateContest(this.editingContest()!.id.toString(), data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã cập nhật cuộc thi',
          });
          this.showContestDialog.set(false);
          this.isSubmittingDialog.set(false);
          this.loadContests();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể cập nhật cuộc thi',
          });
          this.isSubmittingDialog.set(false);
        },
      });
    } else {
      this.contestsService.createContest(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã tạo cuộc thi mới',
          });
          this.showContestDialog.set(false);
          this.isSubmittingDialog.set(false);
          this.page.set(1);
          this.loadContests();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tạo cuộc thi',
          });
          this.isSubmittingDialog.set(false);
        },
      });
    }
  }

  deleteContest(event: Event, contest: ContestsModel): void {
    event.stopPropagation();
    this.confirmService.confirm({
      message: `Bạn có chắc muốn xóa cuộc thi "${contest.title}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.contestsService.deleteContest(contest.id.toString()).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã xóa cuộc thi',
            });
            this.loadContests();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Không thể xóa cuộc thi',
            });
          },
        });
      },
    });
  }

  closeContestDialog(): void {
    this.showContestDialog.set(false);
  }

  viewContest(contest: ContestsModel): void {
    this.router.navigate([contest.id], { relativeTo: this.route });
  }

  // ==================== Helpers ====================

  getStatusSeverity(status: ContestStatusEnum): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return this.contestsService.getStatusSeverity(status);
  }

  getStatusLabel(status: ContestStatusEnum): string {
    return this.contestsService.getStatusLabel(status);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
