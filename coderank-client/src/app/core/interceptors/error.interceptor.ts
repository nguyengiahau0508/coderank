import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Đã xảy ra lỗi không xác định';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Lỗi: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Yêu cầu không hợp lệ';
            break;
          case 401:
            errorMessage = 'Phiên đăng nhập đã hết hạn';
            authService.clearAuth();
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Bạn không có quyền truy cập';
            break;
          case 404:
            errorMessage = 'Không tìm thấy tài nguyên';
            break;
          case 500:
            errorMessage = 'Lỗi máy chủ nội bộ';
            break;
          default:
            errorMessage = error.error?.message || `Lỗi: ${error.status}`;
        }
      }
      
      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        error: error.error
      });
      
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
