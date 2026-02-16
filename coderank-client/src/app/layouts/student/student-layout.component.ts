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
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/student/dashboard'
    },
    {
      label: 'Problems',
      icon: 'pi pi-code',
      route: '/student/problems'
    },
    {
      label: 'My Submissions',
      icon: 'pi pi-send',
      route: '/student/submissions'
    },
    {
      label: 'Contests',
      icon: 'pi pi-trophy',
      route: '/student/contests'
    },
    {
      label: 'Leaderboard',
      icon: 'pi pi-star',
      route: '/student/leaderboard'
    }
  ];
}
