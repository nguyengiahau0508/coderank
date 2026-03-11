import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  template: `
    <aside 
      class="flex flex-col transition-all duration-300 ease-in-out h-full"
      style="background-color: var(--cr-bg-secondary); border-right: 1px solid var(--cr-border);"
      [class.w-64]="!collapsed()"
      [class.w-20]="collapsed()"
    >
      <!-- Navigation -->
      <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        @for (item of menuItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active-link"
            [routerLinkActiveOptions]="{exact: false}"
            class="nav-link group"
          >
            <div class="nav-link-content">
              <i [class]="item.icon + ' nav-icon'"></i>
              
              @if (!collapsed()) {
                <span class="nav-label">{{ item.label }}</span>
                
                @if (item.badge) {
                  <span 
                    class="nav-badge"
                    [style.background-color]="'rgba(248, 81, 73, 0.15)'"
                    [style.color]="'var(--cr-accent-red)'"
                  >
                    {{ item.badge }}
                  </span>
                }
              } @else if (item.badge) {
                <span class="nav-badge-dot"></span>
              }
            </div>
          </a>
        }
      </nav>

      <!-- Footer -->
      <div class="p-4" style="border-top: 1px solid var(--cr-border);">
        @if (!collapsed()) {
          <div class="text-center">
            <p class="text-xs font-medium" style="color: var(--cr-text-subtle);">CodeRank</p>
            <p class="text-xs mt-1" style="color: var(--cr-text-subtle);">© 2026</p>
          </div>
        } @else {
          <div class="flex justify-center">
            <div class="w-2 h-2 rounded-full" style="background: var(--cr-border);"></div>
          </div>
        }
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .nav-link {
      display: flex;
      align-items: center;
      position: relative;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      cursor: pointer;
      color: var(--cr-text-muted);
      transition: all 0.2s;
    }

    .nav-link:hover {
      color: var(--cr-text-primary);
      background-color: var(--cr-bg-tertiary);
    }

    .nav-link-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
    }

    .nav-icon {
      font-size: 1rem;
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .nav-link:hover .nav-icon {
      transform: scale(1.05);
    }

    .nav-label {
      font-size: 0.875rem;
      font-weight: 400;
      flex: 1;
      white-space: nowrap;
    }

    .nav-badge {
      padding: 0.125rem 0.5rem;
      font-size: 0.6875rem;
      font-weight: 500;
      border-radius: 9999px;
      flex-shrink: 0;
    }

    .nav-badge-dot {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 0.5rem;
      height: 0.5rem;
      background-color: var(--cr-accent-red);
      border-radius: 9999px;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .active-link {
      background: rgba(88, 166, 255, 0.1);
      color: var(--cr-accent-blue);
    }

    .active-link .nav-icon {
      color: var(--cr-accent-blue);
    }

    .active-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 0.1875rem;
      height: 1.5rem;
      background: linear-gradient(to bottom, var(--cr-accent-blue), var(--cr-syntax-function));
      border-radius: 0 9999px 9999px 0;
    }

    /* Smooth scrollbar */
    nav::-webkit-scrollbar {
      width: 4px;
    }

    nav::-webkit-scrollbar-track {
      background: transparent;
    }

    nav::-webkit-scrollbar-thumb {
      background: var(--cr-bg-elevated);
      border-radius: 2px;
    }

    nav::-webkit-scrollbar-thumb:hover {
      background: var(--cr-border);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  menuItems = input.required<MenuItem[]>();
}
