import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  from,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../services';

/** Đánh dấu request đã được retry sau khi refresh token */
const IS_RETRY = new HttpContextToken<boolean>(() => false);

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Nếu là lỗi 401 và không phải auth URL, không phải retry → thử refresh token
      if (
        error.status === 401 &&
        !isAuthUrl(req.url) &&
        !req.context.get(IS_RETRY)
      ) {
        return handle401Error(req, next, authService, router);
      }

      return handleError(error, authService, router);
    }),
  );
};

/**
 * Kiểm tra URL có phải là auth endpoint không (tránh refresh loop)
 */
function isAuthUrl(url: string): boolean {
  return (
    url.includes('/auth/refresh-tokens') ||
    url.includes('/auth/logout')
  );
}

/**
 * Xử lý lỗi 401:
 * - Nếu chưa có request nào đang refresh → gửi refresh token, retry request gốc
 * - Nếu đang refresh → đợi kết quả refresh, rồi retry
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return from(authService.refreshToken()).pipe(
      switchMap((success: boolean) => {
        isRefreshing = false;

        if (success) {
          const newToken = authService.getToken()!;
          refreshTokenSubject.next(newToken);
          return next(cloneWithToken(req, newToken));
        }

        // Refresh thất bại → clear auth và chuyển về login
        refreshTokenSubject.next(null);
        authService.clearAuth();
        router.navigate(['/login']);
        return throwError(() => ({
          status: 401,
          message: 'Phiên đăng nhập đã hết hạn',
          originalError: new HttpErrorResponse({ status: 401 }),
        }));
      }),
      catchError((err) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        authService.clearAuth();
        router.navigate(['/login']);
        return throwError(() => ({
          status: 401,
          message: 'Phiên đăng nhập đã hết hạn',
          originalError: err,
        }));
      }),
    );
  }

  // Đã có request khác đang refresh → đợi token mới rồi retry
  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(cloneWithToken(req, token))),
  );
}

/**
 * Clone request với token mới và đánh dấu là retry
 */
function cloneWithToken(
  req: HttpRequest<unknown>,
  token: string,
): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
    withCredentials: true,
    context: req.context.set(IS_RETRY, true),
  });
}

/**
 * Xử lý các lỗi HTTP khác (400, 403, 404, 500, v.v.)
 */
function handleError(
  error: HttpErrorResponse,
  authService: AuthService,
  router: Router,
): Observable<never> {
  let errorMessage = 'Đã xảy ra lỗi không xác định';

  if (error.error instanceof ErrorEvent) {
    errorMessage = `Lỗi: ${error.error.message}`;
  } else {
    switch (error.status) {
      case 400:
        errorMessage = error.error?.message || 'Yêu cầu không hợp lệ';
        break;
      case 401:
        // 401 đến đây = refresh đã thất bại hoặc request từ auth URL
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
    error: error.error,
  });

  return throwError(() => ({
    status: error.status,
    message: errorMessage,
    originalError: error,
  }));
}
