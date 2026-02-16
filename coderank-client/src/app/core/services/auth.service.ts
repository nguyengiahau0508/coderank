import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  roles: string[];
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';

  private currentUserSignal = signal<User | null>(this.loadUserFromStorage());
  
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  setAuth(accessToken: string, user: User): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  clearAuth(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  async loginWithGoogle(): Promise<void> {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  async loginWithGithub(): Promise<void> {
    window.location.href = `${environment.apiUrl}/auth/github`;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.api.get('/auth/logout'));
    } finally {
      this.clearAuth();
      this.router.navigate(['/login']);
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.api.post<AuthResponse>('/auth/refresh-tokens', {}));
      if (response?.accessToken) {
        this.setAuth(response.accessToken, response.user);
        return true;
      }
      return false;
    } catch {
      this.clearAuth();
      return false;
    }
  }
}
