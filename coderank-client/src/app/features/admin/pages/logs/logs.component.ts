import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComingSoonPageComponent } from '../../../../shared/components/coming-soon-page/coming-soon-page.component';

@Component({
  selector: 'app-admin-logs',
  imports: [ComingSoonPageComponent],
  template: `<app-coming-soon-page title="System Logs" subtitle="View system activity logs" icon="pi-file-edit" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLogsComponent {}
