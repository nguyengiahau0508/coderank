import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, AvatarModule, MenuModule, BadgeModule],
  template: `
    <header class="sticky top-0 z-50 backdrop-blur-md border-b" style="background: rgba(22, 27, 34, 0.85); border-color: var(--cr-border);">
      <div class="flex items-center justify-between h-14 px-6 mx-auto">
        <!-- Left Section -->
        <div class="flex items-center gap-4">
          <button 
            pButton 
            icon="pi pi-bars" 
            class="p-button-text p-button-rounded transition-all"
            style="color: var(--cr-text-muted);"
            (click)="toggleSidebar.emit()"
            aria-label="Toggle sidebar"
          ></button>
          
          <div class="flex items-center gap-3 cursor-pointer group" (click)="navigateHome()">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, var(--cr-syntax-keyword), var(--cr-syntax-function));">
              <i class="pi pi-code text-white text-sm"></i>
            </div>
            <span class="text-lg font-semibold tracking-tight hidden sm:block" style="color: var(--cr-text-primary);">
              Code<span style="color: var(--cr-syntax-function);">Rank</span>
            </span>
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2">
          <!-- Applications -->
          <button
            pButton
            icon="pi pi-th-large"
            class="p-button-text p-button-rounded transition-all relative"
            style="color: var(--cr-text-muted);"
            aria-label="Open applications"
            (click)="appsMenu.toggle($event)"
          ></button>

          <!-- Notifications -->
          <button 
            pButton 
            icon="pi pi-bell" 
            class="p-button-text p-button-rounded transition-all relative"
            style="color: var(--cr-text-muted);"
            pBadge="3"
            severity="danger"
            aria-label="Notifications"
          ></button>

          <!-- Divider -->
          <div class="w-px h-6 mx-2 hidden md:block" style="background: var(--cr-border);"></div>

          <!-- User Menu -->
          @if (user(); as currentUser) {
            <div 
              class="flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-all group"
              style="hover: background: var(--cr-bg-elevated);"
              (click)="menu.toggle($event)"
            >
              @if (currentUser.avatar) {
                <p-avatar 
                  [image]="currentUser.avatar" 
                  shape="circle" 
                  size="normal"
                  styleClass="border border-[#30363d]"
                />
              } @else {
                <p-avatar 
                  [label]="currentUser.username.charAt(0).toUpperCase()" 
                  shape="circle" 
                  size="normal"
                  styleClass="border border-[#30363d]"
                  style="background: linear-gradient(135deg, var(--cr-syntax-keyword), var(--cr-syntax-function)); color: white;"
                />
              }
              
              <div class="hidden md:block">
                <div class="text-sm font-medium" style="color: var(--cr-text-primary);">{{ currentUser.username }}</div>
                <div class="text-xs" style="color: var(--cr-text-muted);">{{ currentUser.email }}</div>
              </div>
              
              <i class="pi pi-angle-down text-sm transition-colors hidden md:block" style="color: var(--cr-text-subtle);"></i>
            </div>
          }

          <p-menu
            #appsMenu
            [model]="appMenuItems"
            [popup]="true"
            styleClass="mt-2 rounded-lg"
          />

          <p-menu 
            #menu 
            [model]="menuItems" 
            [popup]="true"
            styleClass="mt-2 rounded-lg"
          />
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host ::ng-deep {
      .p-badge {
        min-width: 1.25rem;
        height: 1.25rem;
        line-height: 1.25rem;
        font-size: 0.625rem;
      }
      
      .p-menu {
        border-radius: 0.5rem;
        overflow: hidden;
        min-width: 12rem;
        background: var(--cr-bg-elevated);
        border: 1px solid var(--cr-border);
        box-shadow: 0 8px 24px rgba(1, 4, 9, 0.5);
      }
      
      .p-menu .p-menuitem-link {
        padding: 0.625rem 1rem;
        transition: all 0.2s;
      }
      
      .p-menu .p-menuitem-link:hover {
        background: var(--cr-bg-tertiary);
      }
      
      .p-menu .p-menuitem-icon {
        color: var(--cr-text-muted);
        margin-right: 0.75rem;
      }
      
      .p-menu .p-menuitem-text {
        color: var(--cr-text-secondary);
        font-weight: 400;
        font-size: 0.875rem;
      }
      
      .p-menu-separator {
        margin: 0.25rem 0;
        border-top-color: var(--cr-border);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  toggleSidebar = output<void>();
  
  readonly user = this.authService.currentUser;
  readonly appMenuItems: MenuItem[] = [
    {
      label: 'IDE',
      icon: 'pi pi-code',
      command: () => this.navigateIde()
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
