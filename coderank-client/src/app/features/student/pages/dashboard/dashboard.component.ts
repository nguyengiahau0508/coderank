import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services';

@Component({
  selector: 'app-dashboard',
  imports: [],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 class="text-2xl font-light text-slate-900">CodeRank</h1>
          
          <div class="flex items-center gap-4">
            @if (user()) {
              <div class="flex items-center gap-3">
                @if (user()?.avatar) {
                  <img 
                    [src]="user()!.avatar" 
                    [alt]="user()!.username"
                    class="w-9 h-9 rounded-full border border-slate-200"
                  />
                }
                <div class="text-right">
                  <p class="text-sm font-medium text-slate-900">{{ user()?.username }}</p>
                  <p class="text-xs text-slate-500">{{ user()?.email }}</p>
                </div>
              </div>
              <button
                (click)="logout()"
                class="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Đăng xuất
              </button>
            }
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-16">
        <div class="text-center">
          <h2 class="text-4xl font-light text-slate-900 mb-4">
            Chào mừng trở lại! 👋
          </h2>
          <p class="text-slate-500 font-light">
            Dashboard sẽ được phát triển sau
          </p>
        </div>
      </main>
    </div>
  `,
  styles: ``
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  
  readonly user = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
  }
}
