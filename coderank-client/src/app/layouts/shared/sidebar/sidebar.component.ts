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
      class="flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out h-full"
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
                    [class]="'nav-badge ' + (item.badgeClass || 'bg-blue-500 text-white')"
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
      <div class="border-t border-gray-100 p-4">
        @if (!collapsed()) {
          <div class="text-center">
            <p class="text-xs text-gray-400 font-medium">CodeRank</p>
            <p class="text-xs text-gray-400 mt-1">© 2026</p>
          </div>
        } @else {
          <div class="flex justify-center">
            <div class="w-2 h-2 rounded-full bg-gray-300"></div>
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
      padding: 0.625rem 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      color: rgb(75 85 99);
      transition: all 0.2s;
    }

    .nav-link:hover {
      color: rgb(17 24 39);
      background-color: rgb(249 250 251);
    }

    .nav-link-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
    }

    .nav-icon {
      font-size: 1.125rem;
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .nav-link:hover .nav-icon {
      transform: scale(1.1);
    }

    .nav-label {
      font-size: 0.875rem;
      font-weight: 500;
      flex: 1;
      white-space: nowrap;
    }

    .nav-badge {
      padding: 0.125rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      flex-shrink: 0;
    }

    .nav-badge-dot {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 0.5rem;
      height: 0.5rem;
      background-color: rgb(239 68 68);
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
      background: linear-gradient(to right, rgb(239 246 255), rgb(250 245 255));
      color: rgb(37 99 235);
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    .active-link .nav-icon {
      color: rgb(37 99 235);
    }

    .active-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 0.25rem;
      height: 2rem;
      background: linear-gradient(to bottom, rgb(59 130 246), rgb(147 51 234));
      border-radius: 0 9999px 9999px 0;
    }

    /* Smooth scrollbar */
    nav::-webkit-scrollbar {
      width: 6px;
    }

    nav::-webkit-scrollbar-track {
      background: transparent;
    }

    nav::-webkit-scrollbar-thumb {
      background: rgb(229 231 235);
      border-radius: 3px;
    }

    nav::-webkit-scrollbar-thumb:hover {
      background: rgb(209 213 219);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  menuItems = input.required<MenuItem[]>();
}
