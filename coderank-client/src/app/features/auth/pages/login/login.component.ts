import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services';

@Component({
  selector: 'app-login',
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center relative overflow-hidden" style="background-color: var(--cr-bg-primary);">
      <!-- Background grid pattern -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(var(--cr-text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--cr-text-muted) 1px, transparent 1px); background-size: 60px 60px;"></div>
      
      <!-- Gradient orbs -->
      <div class="absolute top-1/4 -left-32 w-64 h-64 rounded-full blur-[128px] opacity-20" style="background: var(--cr-syntax-function);"></div>
      <div class="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full blur-[128px] opacity-20" style="background: var(--cr-accent-blue);"></div>

      <div class="w-full max-w-md px-8 relative z-10">
        <!-- Logo/Brand -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style="background: linear-gradient(135deg, var(--cr-syntax-keyword), var(--cr-syntax-function)); box-shadow: 0 0 40px rgba(210, 168, 255, 0.2);">
            <i class="pi pi-code text-white text-2xl"></i>
          </div>
          <h1 class="text-3xl font-semibold tracking-tight" style="color: var(--cr-text-primary);">
            Code<span style="color: var(--cr-syntax-function);">Rank</span>
          </h1>
          <p class="mt-3 text-sm" style="color: var(--cr-text-muted);">
            Nền tảng đánh giá kỹ năng lập trình
          </p>
        </div>

        <!-- Auth Card -->
        <div class="rounded-lg p-10" style="background-color: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
          <div class="space-y-5">
            <h2 class="text-xl font-medium text-center mb-8" style="color: var(--cr-text-primary);">
              Đăng nhập
            </h2>

            <!-- Google Button -->
            <button
              (click)="loginWithGoogle()"
              type="button"
              class="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-lg text-sm font-normal transition-all duration-200 ease-out"
              style="background-color: var(--cr-bg-tertiary); border: 1px solid var(--cr-border); color: var(--cr-text-secondary);"
              onmouseover="this.style.borderColor='var(--cr-text-subtle)'"
              onmouseout="this.style.borderColor='var(--cr-border)'"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full" style="border-top: 1px solid var(--cr-border);"></div>
              </div>
              <div class="relative flex justify-center text-xs">
                <span class="px-4" style="background-color: var(--cr-bg-secondary); color: var(--cr-text-subtle);">HOẶC</span>
              </div>
            </div>

            <!-- GitHub Button -->
            <button
              (click)="loginWithGithub()"
              type="button"
              class="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-lg text-sm font-normal transition-all duration-200 ease-out"
              style="background-color: var(--cr-bg-elevated); border: 1px solid var(--cr-border); color: var(--cr-text-primary);"
              onmouseover="this.style.borderColor='var(--cr-text-subtle)'"
              onmouseout="this.style.borderColor='var(--cr-border)'"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Tiếp tục với GitHub</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <p class="mt-8 text-center text-xs" style="color: var(--cr-text-subtle);">
          Bằng cách đăng nhập, bạn đồng ý với các điều khoản sử dụng của chúng tôi
        </p>
      </div>
    </div>
  `,
  styles: ``
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  loginWithGithub(): void {
    this.authService.loginWithGithub();
  }
}
