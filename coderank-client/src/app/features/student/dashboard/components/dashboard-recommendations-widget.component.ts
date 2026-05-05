import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Tag } from 'primeng/tag';
import { StudentDashboardModel } from '../../../../data';

@Component({
  selector: 'app-dashboard-recommendations-widget',
  imports: [CommonModule, RouterLink, Tag],
  template: `
    <section class="rounded-xl p-4" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
      <h2 class="text-sm font-semibold mb-3" style="color: var(--cr-text-primary);">Gợi ý học tập</h2>

      @if (activeLearningPath(); as path) {
        <a
          routerLink="/student/problems"
          class="block rounded-lg p-3 mb-3 transition-colors hover:brightness-110"
          style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);"
        >
          <p class="text-xs font-semibold uppercase tracking-wide" style="color: var(--cr-text-subtle);">Learning Path</p>
          <p class="text-sm font-semibold mt-1" style="color: var(--cr-text-primary);">{{ path.title }}</p>
          <p class="text-[11px] mt-1" style="color: var(--cr-text-muted);">{{ path.goalTopic }} · {{ path.targetLevel }}</p>
          <div class="mt-2 h-1.5 rounded-full overflow-hidden" style="background: var(--cr-bg-tertiary);">
            <div
              class="h-full rounded-full"
              style="background: linear-gradient(90deg, var(--cr-accent-blue), var(--cr-accent-green));"
              [style.width.%]="path.progressPercent"
            ></div>
          </div>
        </a>
      }

      @if (problems().length > 0) {
        <div class="space-y-2.5">
          @for (problem of problems(); track problem.id) {
            <a
              [routerLink]="'/student/problems/' + problem.id"
              class="block rounded-lg p-3 transition-colors hover:brightness-110"
              style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-semibold truncate" style="color: var(--cr-text-primary);">{{ problem.title }}</p>
                <span class="text-xs font-semibold" style="color: var(--cr-accent-green);">{{ problem.points }}đ</span>
              </div>
              <div class="mt-1.5 flex items-center gap-2">
                <p-tag [value]="problem.difficulty" [severity]="getDifficultySeverity(problem.difficulty)" styleClass="text-[10px]" />
              </div>
            </a>
          }
        </div>
      } @else {
        <div class="rounded-lg p-6 text-center" style="background: var(--cr-bg-primary); border: 1px dashed var(--cr-border);">
          <p class="text-sm" style="color: var(--cr-text-muted);">Chưa có gợi ý bài tập phù hợp.</p>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardRecommendationsWidgetComponent {
  readonly problems =
    input<StudentDashboardModel['recommendations']['problems']>([]);
  readonly activeLearningPath =
    input<StudentDashboardModel['recommendations']['activeLearningPath'] | null>(
      null,
    );

  getDifficultySeverity(difficulty: string): 'success' | 'info' | 'warn' {
    if (difficulty === 'easy') return 'success';
    if (difficulty === 'medium') return 'info';
    return 'warn';
  }
}
