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
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="flex items-center justify-between h-16 px-6 mx-auto">
        <!-- Left Section -->
        <div class="flex items-center gap-4">
          <button 
            pButton 
            icon="pi pi-bars" 
            class="p-button-text p-button-rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
            (click)="toggleSidebar.emit()"
            aria-label="Toggle sidebar"
          ></button>
          
          <div class="flex items-center gap-3 cursor-pointer" (click)="navigateHome()">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <i class="pi pi-code text-white text-lg"></i>
            </div>
            <span class="text-xl font-semibold text-gray-900 tracking-tight hidden sm:block">CodeRank</span>
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2">
          <!-- Notifications -->
          <button 
            pButton 
            icon="pi pi-bell" 
            class="p-button-text p-button-rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all relative"
            pBadge="3"
            severity="danger"
            aria-label="Notifications"
          ></button>

          <!-- Divider -->
          <div class="w-px h-8 bg-gray-200 mx-2 hidden md:block"></div>

          <!-- User Menu -->
          @if (user(); as currentUser) {
            <div 
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
              (click)="menu.toggle($event)"
            >
              @if (currentUser.avatar) {
                <p-avatar 
                  [image]="currentUser.avatar" 
                  shape="circle" 
                  size="normal"
                  styleClass="border-2 border-gray-200"
                />
              } @else {
                <p-avatar 
                  [label]="currentUser.username.charAt(0).toUpperCase()" 
                  shape="circle" 
                  size="normal"
                  styleClass="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-2 border-gray-200"
                />
              }
              
              <div class="hidden md:block">
                <div class="text-sm font-medium text-gray-900">{{ currentUser.username }}</div>
                <div class="text-xs text-gray-500">{{ currentUser.email }}</div>
              </div>
              
              <i class="pi pi-angle-down text-gray-400 text-sm group-hover:text-gray-600 transition-colors hidden md:block"></i>
            </div>
          }

          <p-menu 
            #menu 
            [model]="menuItems" 
            [popup]="true"
            styleClass="mt-2 shadow-lg border border-gray-100 rounded-xl"
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
        border-radius: 0.75rem;
        overflow: hidden;
        min-width: 12rem;
      }
      
      .p-menu .p-menuitem-link {
        padding: 0.75rem 1rem;
        transition: all 0.2s;
      }
      
      .p-menu .p-menuitem-link:hover {
        background: #f3f4f6;
      }
      
      .p-menu .p-menuitem-icon {
        color: #6b7280;
        margin-right: 0.75rem;
      }
      
      .p-menu .p-menuitem-text {
        color: #1f2937;
        font-weight: 500;
      }
      
      .p-menu-separator {
        margin: 0.25rem 0;
        border-top-color: #e5e7eb;
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

  readonly menuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile'])
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings'])
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
}
