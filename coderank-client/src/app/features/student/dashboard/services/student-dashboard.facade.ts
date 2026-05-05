import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardApi, StudentDashboardModel } from '../../../../data';

@Injectable({ providedIn: 'root' })
export class StudentDashboardFacade {
  private readonly dashboardApi = inject(DashboardApi);

  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly dashboard = signal<StudentDashboardModel | null>(null);

  readonly profile = computed(() => this.dashboard()?.profile ?? null);
  readonly learning = computed(() => this.dashboard()?.learning ?? null);
  readonly contests = computed(() => this.dashboard()?.contests ?? null);
  readonly recommendations = computed(
    () => this.dashboard()?.recommendations ?? null,
  );
  readonly partialFailures = computed(
    () => this.dashboard()?.meta.partialFailures ?? [],
  );

  async loadDashboard(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const response = await firstValueFrom(this.dashboardApi.getMyDashboard());
      this.dashboard.set(response.data ?? null);
    } catch {
      this.dashboard.set(null);
      this.errorMessage.set('Không thể tải dữ liệu dashboard.');
    } finally {
      this.loading.set(false);
    }
  }
}
