import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComingSoonPageComponent } from '../../../../shared/components/coming-soon-page/coming-soon-page.component';

@Component({
  selector: 'app-admin-settings',
  imports: [ComingSoonPageComponent],
  template: `<app-coming-soon-page title="Settings" subtitle="Configure system settings" icon="pi-cog" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsComponent {}
