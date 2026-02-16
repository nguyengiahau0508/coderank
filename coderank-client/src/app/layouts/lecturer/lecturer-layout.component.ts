import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseLayoutComponent } from '../base/base-layout.component';
import { MenuItem } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-lecturer-layout',
  imports: [BaseLayoutComponent],
  template: `<app-base-layout [items]="menuItems" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LecturerLayoutComponent {
  protected menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/lecturer/dashboard'
    },
    {
      label: 'My Courses',
      icon: 'pi pi-book',
      route: '/lecturer/courses'
    },
    {
      label: 'Problem Bank',
      icon: 'pi pi-database',
      route: '/lecturer/problems'
    },
    {
      label: 'Contests',
      icon: 'pi pi-trophy',
      route: '/lecturer/contests'
    },
    {
      label: 'Students',
      icon: 'pi pi-users',
      route: '/lecturer/students'
    },
    {
      label: 'Submissions',
      icon: 'pi pi-inbox',
      route: '/lecturer/grading',
      badge: '5',
      badgeClass: 'bg-red-500 text-white'
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-line',
      route: '/lecturer/analytics'
    }
  ];
}
