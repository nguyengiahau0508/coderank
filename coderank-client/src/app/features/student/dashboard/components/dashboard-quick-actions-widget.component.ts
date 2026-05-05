import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentDashboardQuickActionModel } from '../../../../data';

@Component({
  selector: 'app-dashboard-quick-actions-widget',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="rounded-xl p-4" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
      <h2 class="text-sm font-semibold mb-3" style="color: var(--cr-text-primary);">Hành động nhanh</h2>
      <div class="grid grid-cols-1 gap-2.5">
        @for (action of actions(); track action.route) {
          <a
            [routerLink]="action.route"
            class="rounded-lg p-3 transition-colors hover:brightness-110"
            style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);"
          >
            <div class="flex items-start gap-3">
              <i [class]="action.icon + ' text-sm mt-0.5'" style="color: var(--cr-accent-blue);"></i>
              <div class="min-w-0">
                <p class="text-sm font-semibold" style="color: var(--cr-text-primary);">{{ action.label }}</p>
                <p class="text-[11px] mt-1" style="color: var(--cr-text-muted);">{{ action.description }}</p>
              </div>
            </div>
          </a>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardQuickActionsWidgetComponent {
  readonly actions = input<StudentDashboardQuickActionModel[]>([]);
}
