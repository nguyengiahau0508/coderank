import {
  Component,
  ChangeDetectionStrategy,
  signal,
  effect,
  inject,
  HostListener,
  input,
} from '@angular/core';
import { Router, RouterModule, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../shared/header/header.component';
import { SidebarComponent, MenuItem } from '../shared/sidebar/sidebar.component';
import { AiChatComponent } from '../../shared/components/ai-chat/ai-chat.component';

@Component({
  selector: 'app-base-layout',
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, AiChatComponent],
  templateUrl: './base-layout.commponnet.html',
  styleUrls: ['./base-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseLayoutComponent {
  private router = inject(Router);

  // Input for menu items from child layouts
  items = input<MenuItem[]>([]);

  protected sidebarCollapsed = signal(false);
  protected menuItems: MenuItem[] = [];
  protected isNavigating = signal(false);
  protected isMobileScreen = signal(false);

  constructor() {
    // Load sidebar state from localStorage
    this.loadSidebarState();

    // Persist sidebar state to localStorage
    effect(() => {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(this.sidebarCollapsed()));
    });

    // Check initial screen size
    this.checkScreenSize();

    // Auto-collapse sidebar on mobile on init
    if (this.isMobileScreen()) {
      this.sidebarCollapsed.set(true);
    }

    // Track navigation state for loading bar
    this.router.events
      .pipe(filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.isNavigating.set(true);
        } else {
          // Small delay to show the loading bar
          setTimeout(() => this.isNavigating.set(false), 200);

          // Auto-close sidebar on mobile after navigation
          if (this.isMobileScreen()) {
            this.sidebarCollapsed.set(true);
          }
        }
      });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
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
    this.isMobileScreen.set(window.innerWidth < 1024); // lg breakpoint
  }

  private loadSidebarState(): void {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      try {
        this.sidebarCollapsed.set(JSON.parse(savedState));
      } catch {
        // Ignore parsing errors
      }
    }
  }
}
