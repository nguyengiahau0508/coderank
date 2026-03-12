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
  template: `
    <div class="h-screen flex flex-col overflow-hidden" style="background-color: var(--cr-bg-primary);">
      <!-- Loading bar for route changes -->
      @if (isNavigating()) {
        <div class="fixed top-0 left-0 right-0 z-[9999] h-0.5 animate-pulse" style="background: linear-gradient(90deg, var(--cr-syntax-keyword), var(--cr-syntax-function), var(--cr-accent-blue));"></div>
      }

      <app-header (toggleSidebar)="toggleSidebar()" />
      
      <div class="flex flex-1 overflow-hidden relative">
        <!-- Mobile overlay when sidebar is open -->
        @if (!sidebarCollapsed() && isMobile()) {
          <div 
            class="fixed inset-0 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300"
            style="background: rgba(1, 4, 9, 0.7);"
            (click)="closeSidebar()"
          ></div>
        }

        <app-sidebar 
          [collapsed]="sidebarCollapsed()"
          [menuItems]="items()"
          class="transition-transform duration-300 ease-in-out z-40"
          [class.translate-x-0]="!sidebarCollapsed() || !isMobile()"
          [class.-translate-x-full]="sidebarCollapsed() && isMobile()"
        />
        
        <main 
          class="flex-1 overflow-y-auto transition-all duration-300 ease-in-out"
          [class.lg:ml-0]="sidebarCollapsed()"
        >
          <div class="min-h-full" style="background-color: var(--cr-bg-primary);">
            <div class="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
              <div class="animate-fade-in">
                <router-outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- AI Assistant Chat Widget (outside overflow-hidden container) -->
    <app-ai-chat />
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    main {
      position: relative;
    }

    main::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 200px;
      background: linear-gradient(180deg, rgba(88, 166, 255, 0.03) 0%, transparent 100%);
      pointer-events: none;
      z-index: 0;
    }

    /* Custom scrollbar for main content */
    main::-webkit-scrollbar {
      width: 8px;
    }

    main::-webkit-scrollbar-track {
      background: transparent;
    }

    main::-webkit-scrollbar-thumb {
      background: var(--cr-bg-elevated);
      border-radius: 4px;
    }

    main::-webkit-scrollbar-thumb:hover {
      background: var(--cr-border);
    }

    /* Fade in animation for page transitions */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    /* Loading bar animation */
    @keyframes loadingBar {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `],
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
