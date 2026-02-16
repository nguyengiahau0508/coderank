import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from localStorage (hoặc từ service của bạn)
  const token = localStorage.getItem('access_token');

  // Clone request và thêm authorization header nếu có token
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true // Để gửi cookies
    });
  } else {
    // Vẫn gửi withCredentials để nhận cookies
    req = req.clone({
      withCredentials: true
    });
  }

  return next(req);
};
