import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services';

@Component({
  selector: 'app-callback',
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white shadow-sm">
          <div class="w-8 h-8 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
        <p class="text-sm text-slate-500 font-light">
          {{ message }}
        </p>
      </div>
    </div>
  `,
  styles: ``
})
export class CallbackComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  message = 'Đang xác thực...';

  ngOnInit(): void {
    this.handleCallback();
  }

  private async handleCallback(): Promise<void> {
    try {
      const fragment = this.route.snapshot.fragment;
      const queryParams = this.route.snapshot.queryParams;

      // Parse token from URL fragment (OAuth flow)
      let accessToken = queryParams['accessToken'];
      let userJson = queryParams['user'];

      if (fragment) {
        const params = new URLSearchParams(fragment);
        accessToken = params.get('accessToken') || accessToken;
        userJson = params.get('user') || userJson;
      }

      if (!accessToken || !userJson) {
        this.message = 'Đăng nhập thất bại';
        setTimeout(() => this.router.navigate(['/login']), 2000);
        return;
      }

      const user = JSON.parse(decodeURIComponent(userJson));
      this.authService.setAuth(accessToken, user);

      this.message = 'Đăng nhập thành công!';
      setTimeout(() => {
        const returnUrl = queryParams['returnUrl'] || '/';
        this.router.navigate([returnUrl]);
      }, 1000);
    } catch (error) {
      console.error('Callback error:', error);
      this.message = 'Đã xảy ra lỗi';
      setTimeout(() => this.router.navigate(['/login']), 2000);
    }
  }
}
