import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseLayoutComponent } from '../base/base-layout.component';
import { MenuItem } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-student-layout',
  imports: [BaseLayoutComponent],
  template: `<app-base-layout [items]="menuItems" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentLayoutComponent {
  protected menuItems: MenuItem[] = [
    {
      label: 'Problems',
      icon: 'pi pi-code',
      route: '/student/problems'
    },
    {
      label: 'Courses',
      icon: 'pi pi-book',
      route: '/student/courses'
    },
    {
      label: 'Contests',
      icon: 'pi pi-trophy',
      route: '/student/contests'
    },
  ];
}
