import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComingSoonPageComponent } from '../../../../shared/components/coming-soon-page/coming-soon-page.component';

@Component({
  selector: 'app-admin-courses',
  imports: [ComingSoonPageComponent],
  template: `<app-coming-soon-page title="Courses" subtitle="Manage all courses" icon="pi-book" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCoursesComponent {}
