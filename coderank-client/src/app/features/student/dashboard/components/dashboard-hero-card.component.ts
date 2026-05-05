import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDashboardModel } from '../../../../data';

@Component({
  selector: 'app-dashboard-hero-card',
  imports: [CommonModule],
  template: `
    <section
      class="rounded-2xl p-5 sm:p-6"
      style="background: linear-gradient(135deg, color-mix(in srgb, var(--cr-accent-blue) 14%, var(--cr-bg-secondary)) 0%, var(--cr-bg-secondary) 70%); border: 1px solid var(--cr-border);"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.16em] font-semibold" style="color: var(--cr-text-subtle);">Student Dashboard</p>
          <h1 class="text-2xl sm:text-3xl font-bold" style="color: var(--cr-text-primary);">Xin chào, {{ greeting() }}</h1>
          <p class="text-sm" style="color: var(--cr-text-muted);">
            Theo dõi tiến độ học tập, thành tích contest và hành động quan trọng trong một màn hình.
          </p>
        </div>

        <div class="rounded-xl p-4 min-w-[15rem]" style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);">
          <p class="text-xs mb-1" style="color: var(--cr-text-subtle);">Xếp hạng năng lực</p>
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-2xl font-bold leading-none" style="color: var(--cr-text-primary);">{{ profile()?.eloRating || 1400 }}</p>
              <p class="text-[11px] mt-1" style="color: var(--cr-text-muted);">Elo Rating</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold" [style]="tierStyle()">
              {{ profile()?.tier || 'Intermediate' }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="rounded-xl p-3.5" style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);">
          <p class="text-[10px] uppercase tracking-wide" style="color: var(--cr-text-subtle);">Khóa học</p>
          <p class="mt-1 text-xl font-bold" style="color: var(--cr-text-primary);">{{ learning()?.totalCourses || 0 }}</p>
        </div>
        <div class="rounded-xl p-3.5" style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);">
          <p class="text-[10px] uppercase tracking-wide" style="color: var(--cr-text-subtle);">Tiến độ TB</p>
          <p class="mt-1 text-xl font-bold" style="color: var(--cr-accent-green);">{{ learning()?.avgProgress || 0 }}%</p>
        </div>
        <div class="rounded-xl p-3.5" style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);">
          <p class="text-[10px] uppercase tracking-wide" style="color: var(--cr-text-subtle);">Contest đã thi</p>
          <p class="mt-1 text-xl font-bold" style="color: var(--cr-text-primary);">{{ contests()?.totalJoined || 0 }}</p>
        </div>
        <div class="rounded-xl p-3.5" style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);">
          <p class="text-[10px] uppercase tracking-wide" style="color: var(--cr-text-subtle);">Best Rank</p>
          <p class="mt-1 text-xl font-bold" style="color: var(--cr-accent-yellow);">{{ contests()?.bestRank || '—' }}</p>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeroCardComponent {
  readonly profile = input<StudentDashboardModel['profile'] | null>(null);
  readonly learning = input<StudentDashboardModel['learning'] | null>(null);
  readonly contests = input<StudentDashboardModel['contests'] | null>(null);

  readonly greeting = computed(() => {
    const profile = this.profile();
    const fullName = profile?.fullName?.trim();
    if (fullName) {
      return fullName;
    }
    return profile?.username || 'Student';
  });

  readonly tierStyle = computed(() => {
    const tier = this.profile()?.tier;
    if (tier === 'Legend') {
      return 'background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); color: #fff;';
    }
    if (tier === 'Master') {
      return 'background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #fff;';
    }
    if (tier === 'Advanced') {
      return 'background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #fff;';
    }
    if (tier === 'Intermediate') {
      return 'background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: #fff;';
    }
    return 'background: linear-gradient(135deg, #64748b 0%, #475569 100%); color: #fff;';
  });
}
