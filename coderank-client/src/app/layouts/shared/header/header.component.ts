import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, AvatarModule, MenuModule, BadgeModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  toggleSidebar = output<void>();

  readonly user = this.authService.currentUser;
  readonly currentUrl = signal(this.router.url);
  readonly roleLabel = computed(() => {
    const role = this.authService.getPrimaryRole();
    switch (role) {
      case 'admin':
        return 'Admin Workspace';
      case 'instructor':
        return 'Lecturer Workspace';
      case 'problem_setter':
        return 'Problem Setter Workspace';
      case 'student':
        return 'Student Workspace';
      default:
        return 'Workspace';
    }
  });
  readonly currentSectionLabel = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/courses')) return 'Courses';
    if (url.includes('/problems')) return 'Problems';
    if (url.includes('/contests')) return 'Contests';
    if (url.includes('/users')) return 'Users';
    if (url.includes('/students')) return 'Students';
    if (url.includes('/grading')) return 'Submissions';
    if (url.includes('/analytics')) return 'Analytics';
    if (url.includes('/reports')) return 'Reports';
    if (url.includes('/logs')) return 'System Logs';
    if (url.includes('/settings')) return 'Settings';
    if (url.includes('/ide')) return 'Online IDE';
    if (url.includes('/diagram')) return 'System Diagram';
    return 'Workspace';
  });
  readonly appMenuItems: MenuItem[] = [
    {
      label: 'IDE',
      icon: 'pi pi-code',
      command: () => this.navigateIde()
    },
    {
      label: 'System Diagram',
      icon: 'pi pi-sitemap',
      command: () => this.navigateDiagram()
    }
  ];
  readonly menuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile'])
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.navigateSettings()
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.authService.logout()
    }
  ];

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.currentUrl.set(this.router.url);
      });
  }

  navigateHome(): void {
    const primaryRole = this.authService.getPrimaryRole();
    if (primaryRole) {
      this.router.navigate([`/${primaryRole}/dashboard`]);
    }
  }

  navigateIde(): void {
    const ideUrl = this.router.serializeUrl(this.router.createUrlTree(['/ide']));
    if (typeof window !== 'undefined') {
      window.open(ideUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    this.router.navigate(['/ide']);
  }

  navigateDiagram(): void {
    const diagramUrl = this.router.serializeUrl(this.router.createUrlTree(['/diagram']));
    if (typeof window !== 'undefined') {
      window.open(diagramUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    this.router.navigate(['/diagram']);
  }

  private navigateSettings(): void {
    const role = this.authService.getPrimaryRole();
    if (role === 'admin') {
      this.router.navigate(['/admin/settings']);
      return;
    }
    if (role === 'instructor') {
      this.router.navigate(['/lecturer/settings']);
      return;
    }
    this.router.navigate(['/student/settings']);
  }
}
