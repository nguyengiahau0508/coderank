import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from './base.api';
import { ApiResponse } from '../interfaces';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: any; // Define proper User type
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class AuthApi extends BaseApi {
  protected readonly endpoint = '/auth';

  /**
   * Initiate Google OAuth2 authentication flow
   * Opens Google login page in new window
   */
  loginWithGoogle(): void {
    window.location.href = this.getUrl('/google');
  }

  /**
   * Initiate GitHub OAuth2 authentication flow
   */
  loginWithGithub(): void {
    window.location.href = this.getUrl('/github');
  }

  /**
   * Refresh access token using refresh token from cookie
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    return this.apiService.post<RefreshTokenResponse>(
      this.getUrl('/refresh-tokens'),
      {}
    );
  }

  /**
   * Logout current user and revoke tokens
   */
  logout(): Observable<LogoutResponse> {
    return this.apiService.get<LogoutResponse>(this.getUrl('/logout'));
  }
}
