import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseLayoutComponent } from '../base/base-layout.component';
import { MenuItem } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [BaseLayoutComponent],
  template: `<app-base-layout [items]="menuItems" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
  protected menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/admin/dashboard'
    },
    {
      label: 'User Management',
      icon: 'pi pi-users',
      route: '/admin/users'
    },
    {
      label: 'Courses',
      icon: 'pi pi-book',
      route: '/admin/courses'
    },
    {
      label: 'Problems',
      icon: 'pi pi-code',
      route: '/admin/problems'
    },
    {
      label: 'Contests',
      icon: 'pi pi-trophy',
      route: '/admin/contests'
    },
    {
      label: 'Reports',
      icon: 'pi pi-chart-bar',
      route: '/admin/reports'
    },
    {
      label: 'System Logs',
      icon: 'pi pi-file-edit',
      route: '/admin/logs'
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      route: '/admin/settings'
    }
  ];
}
