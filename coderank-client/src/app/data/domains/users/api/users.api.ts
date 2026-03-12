import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi, ApiResponse, PaginatedResponse } from '../../../shared';
import { UsersModel } from '../models/users.model';

export interface UpdateUserDto {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface PaginationQueryUsersDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Users API Service
 * Handles all user-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class UsersApi extends BaseApi {
  protected readonly endpoint = '/users';

  /**
   * Get current user profile
   */
  getProfile(): Observable<ApiResponse<UsersModel>> {
    return this.apiService.get<ApiResponse<UsersModel>>(
      this.getUrl('/profile')
    );
  }

  /**
   * Update current user profile
   */
  updateProfile(dto: UpdateUserDto): Observable<ApiResponse<UsersModel>> {
    return this.apiService.patch<ApiResponse<UsersModel>>(
      this.getUrl('/profile'),
      dto
    );
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): Observable<ApiResponse<UsersModel>> {
    return this.apiService.get<ApiResponse<UsersModel>>(
      this.getUrl(`/${userId}`)
    );
  }

  /**
   * Get paginated list of users (Admin only)
   */
  getUsers(params?: PaginationQueryUsersDto): Observable<PaginatedResponse<UsersModel>> {
    return this.apiService.get<PaginatedResponse<UsersModel>>(
      this.endpoint,
      this.buildParams(params)
    );
  }

  /**
   * Update user (Admin only)
   */
  updateUser(userId: string, dto: UpdateUserDto): Observable<ApiResponse<UsersModel>> {
    return this.apiService.patch<ApiResponse<UsersModel>>(
      this.getUrl(`/${userId}`),
      dto
    );
  }

  /**
   * Delete user (Admin only)
   */
  deleteUser(userId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      this.getUrl(`/${userId}`)
    );
  }

  /**
   * Upload user avatar
   */
  uploadAvatar(file: File): Observable<ApiResponse<{ url: string }>> {
    return this.apiService.upload<ApiResponse<{ url: string }>>(
      this.getUrl('/avatar'),
      file
    );
  }
}
