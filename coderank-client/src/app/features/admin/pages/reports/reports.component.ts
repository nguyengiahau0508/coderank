import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComingSoonPageComponent } from '../../../../shared/components/coming-soon-page/coming-soon-page.component';

@Component({
  selector: 'app-admin-reports',
  imports: [ComingSoonPageComponent],
  template: `<app-coming-soon-page title="Reports" subtitle="View system reports and analytics" icon="pi-chart-bar" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReportsComponent {}
