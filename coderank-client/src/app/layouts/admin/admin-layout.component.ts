import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseLayoutComponent } from '../base/base-layout.component';
import { MenuItem } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [BaseLayoutComponent],
  template: `<app-base-layout [items]="menuItems" [fullHeightSidebar]="true" />`,
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
      label: 'Course',
      icon: 'pi pi-book',
      route: '/admin/courses'
    },
    {
      label: 'Problem',
      icon: 'pi pi-code',
      route: '/admin/problems'
    },
    {
      label: 'Contest',
      icon: 'pi pi-trophy',
      route: '/admin/contests'
    }
  ];
}
