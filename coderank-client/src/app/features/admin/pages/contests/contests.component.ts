import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComingSoonPageComponent } from '../../../../shared/components/coming-soon-page/coming-soon-page.component';

@Component({
  selector: 'app-admin-contests',
  imports: [ComingSoonPageComponent],
  template: `<app-coming-soon-page title="Contests" subtitle="Manage all contests" icon="pi-trophy" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContestsComponent {}
