import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComingSoonPageComponent } from '../../../../shared/components/coming-soon-page/coming-soon-page.component';

@Component({
  selector: 'app-admin-users',
  imports: [ComingSoonPageComponent],
  template: `<app-coming-soon-page title="User Management" subtitle="Manage all users in the system" icon="pi-users" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent {}
