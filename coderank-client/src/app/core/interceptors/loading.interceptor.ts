import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Bỏ qua loading cho một số requests cụ thể
  if (req.headers.has('X-Skip-Loading')) {
    const newHeaders = req.headers.delete('X-Skip-Loading');
    const newReq = req.clone({ headers: newHeaders });
    return next(newReq);
  }
  
  loadingService.show();
  
  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};
