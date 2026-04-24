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
      label: 'Course',
      icon: 'pi pi-book',
      route: '/lecturer/courses'
    },
    {
      label: 'Problem',
      icon: 'pi pi-database',
      route: '/lecturer/problems'
    },
    {
      label: 'Contest',
      icon: 'pi pi-trophy',
      route: '/lecturer/contests'
    }
  ];
}
