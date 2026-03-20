import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
} from '@angular/router';
import { filter } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { AiChatComponent } from '../../shared/components/ai-chat/ai-chat.component';

interface StudentMenuItem {
  label: string;
  icon: string;
  route: string;
  hint?: string;
  badge?: string;
}

@Component({
  selector: 'app-student-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    MenuModule,
    BadgeModule,
    AiChatComponent,
  ],
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentLayoutComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly user = this.authService.currentUser;
  readonly menuItems: StudentMenuItem[] = [
    {
      label: 'Problems',
      icon: 'pi pi-code',
      route: '/student/problems',
      hint: 'Train by topic'
    },
    {
      label: 'Courses',
      icon: 'pi pi-book',
      route: '/student/courses',
      hint: 'Guided learning'
    },
    {
      label: 'Contests',
      icon: 'pi pi-trophy',
      route: '/student/contests',
      hint: 'Weekly challenge',
      badge: 'Hot'
    },
  ];

  readonly userMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile']),
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings']),
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.authService.logout(),
    },
  ];

  readonly currentUrl = signal(this.router.url);
  readonly currentSectionLabel = computed(() => {
    if (this.currentUrl().includes('/contests')) {
      return 'Contest Zone';
    }
    if (this.currentUrl().includes('/courses')) {
      return 'Learning Path';
    }
    return 'Problem Arena';
  });

  readonly isNavigating = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        )
      )
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.isNavigating.set(true);
          return;
        }

        this.currentUrl.set(this.router.url);
        this.isNavigating.set(false);
      });
  }

  navigateHome(): void {
    this.router.navigate(['/student/problems']);
  }
}
