import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
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
