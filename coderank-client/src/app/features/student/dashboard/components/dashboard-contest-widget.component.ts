import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Tag } from 'primeng/tag';
import {
  ContestStatusEnum,
  StudentDashboardModel,
} from '../../../../data';

@Component({
  selector: 'app-dashboard-contest-widget',
  imports: [CommonModule, RouterLink, Tag],
  template: `
    <section class="rounded-xl p-4" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
      <div class="flex items-center justify-between gap-3 mb-3">
        <h2 class="text-sm font-semibold" style="color: var(--cr-text-primary);">Cuộc thi gần đây</h2>
        <a routerLink="/student/contests" class="text-xs font-medium hover:opacity-80" style="color: var(--cr-accent-blue);">Đến contest</a>
      </div>

      @if (recentParticipations().length > 0) {
        <div class="space-y-2.5">
          @for (item of recentParticipations(); track item.contestId) {
            <a
              [routerLink]="'/student/contests/' + item.contestId"
              class="block rounded-lg px-3 py-2.5 transition-colors hover:brightness-110"
              style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-sm font-semibold truncate" style="color: var(--cr-text-primary);">{{ item.title }}</p>
                  <p class="text-[11px] mt-0.5" style="color: var(--cr-text-subtle);">Kết thúc: {{ formatDate(item.endTime) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-semibold" style="color: var(--cr-accent-yellow);">#{{ item.rank || '—' }}</p>
                  <p class="text-[11px]" style="color: var(--cr-text-subtle);">{{ item.totalScore }} điểm</p>
                </div>
              </div>
            </a>
          }
        </div>
      } @else {
        <div class="rounded-lg p-8 text-center" style="background: var(--cr-bg-primary); border: 1px dashed var(--cr-border);">
          <i class="pi pi-trophy text-2xl" style="color: var(--cr-text-subtle);"></i>
          <p class="text-sm mt-2" style="color: var(--cr-text-muted);">Chưa có dữ liệu contest đã thi.</p>
        </div>
      }
    </section>

    <section class="rounded-xl p-4 mt-4" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
      <h2 class="text-sm font-semibold mb-3" style="color: var(--cr-text-primary);">Contest đang diễn ra / sắp diễn ra</h2>

      @if (spotlightContests().length > 0) {
        <div class="space-y-2.5">
          @for (contest of spotlightContests(); track contest.id) {
            <a
              [routerLink]="'/student/contests/' + contest.id"
              class="block rounded-lg px-3 py-2.5 transition-colors hover:brightness-110"
              style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-sm font-semibold truncate" style="color: var(--cr-text-primary);">{{ contest.title }}</p>
                  <p class="text-[11px] mt-0.5" style="color: var(--cr-text-subtle);">Bắt đầu: {{ formatDate(contest.startTime) }}</p>
                </div>
                <p-tag
                  [value]="getContestStatusLabel(contest.status)"
                  [severity]="getContestStatusSeverity(contest.status)"
                  styleClass="text-[10px]"
                />
              </div>
            </a>
          }
        </div>
      } @else {
        <div class="rounded-lg p-6 text-center" style="background: var(--cr-bg-primary); border: 1px dashed var(--cr-border);">
          <p class="text-sm" style="color: var(--cr-text-muted);">Hiện chưa có contest nổi bật.</p>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContestWidgetComponent {
  readonly recentParticipations =
    input<StudentDashboardModel['contests']['recentParticipations']>([]);
  readonly spotlightContests =
    input<StudentDashboardModel['contests']['spotlightContests']>([]);

  formatDate(dateInput?: string): string {
    if (!dateInput) {
      return '—';
    }
    const date = new Date(dateInput);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getContestStatusLabel(status: ContestStatusEnum): string {
    if (status === ContestStatusEnum.Running) return 'Đang diễn ra';
    if (status === ContestStatusEnum.Upcoming) return 'Sắp diễn ra';
    if (status === ContestStatusEnum.Ended) return 'Đã kết thúc';
    return 'Nháp';
  }

  getContestStatusSeverity(
    status: ContestStatusEnum,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (status === ContestStatusEnum.Running) return 'success';
    if (status === ContestStatusEnum.Upcoming) return 'info';
    if (status === ContestStatusEnum.Ended) return 'secondary';
    return 'warn';
  }
}
