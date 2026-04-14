import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterModule,
} from '@angular/router';
import { debounceTime, filter, fromEvent } from 'rxjs';
import { AiChatComponent } from '../../shared/components/ai-chat/ai-chat.component';
import { HeaderComponent } from '../shared/header/header.component';
import { MenuItem, SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-base-layout',
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, AiChatComponent],
  templateUrl: './base-layout.component.html',
  styleUrls: ['./base-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  items = input<MenuItem[]>([]);
  fullHeightSidebar = input<boolean>(false);

  protected readonly sidebarCollapsed = signal(false);
  protected readonly isNavigating = signal(false);
  protected readonly isMobileScreen = signal(false);

  constructor() {
    this.loadSidebarState();

    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(this.sidebarCollapsed()));
      }
    });

    this.checkScreenSize();
    if (this.isMobileScreen()) {
      this.sidebarCollapsed.set(true);
    }

    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(120),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.checkScreenSize();
        });
    }

    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.isNavigating.set(true);
          return;
        }

        setTimeout(() => this.isNavigating.set(false), 180);
        if (this.isMobileScreen()) {
          this.sidebarCollapsed.set(true);
        }
      });
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  protected closeSidebar(): void {
    this.sidebarCollapsed.set(true);
  }

  protected isMobile(): boolean {
    return this.isMobileScreen();
  }

  private checkScreenSize(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.isMobileScreen.set(window.innerWidth < 1024);
  }

  private loadSidebarState(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true' || savedState === 'false') {
      this.sidebarCollapsed.set(savedState === 'true');
    }
  }
}
