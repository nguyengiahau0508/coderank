import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComingSoonPageComponent } from '../../../../shared/components/coming-soon-page/coming-soon-page.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [ComingSoonPageComponent],
  template: `<app-coming-soon-page title="Dashboard" subtitle="System overview and statistics" icon="pi-home" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {}
