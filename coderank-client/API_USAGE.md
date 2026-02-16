# Hướng dẫn sử dụng API Service

## 1. Cấu trúc đã tạo

### Frontend (Angular)

#### Interceptors
- **`auth.interceptor.ts`**: Tự động thêm JWT token vào header của mỗi request
- **`error.interceptor.ts`**: Xử lý lỗi HTTP và hiển thị thông báo phù hợp
- **`loading.interceptor.ts`**: Hiển thị loading indicator khi gọi API

#### Services
- **`api.service.ts`**: Base service để gọi API (GET, POST, PUT, PATCH, DELETE, Upload)
- **`loading.service.ts`**: Quản lý trạng thái loading
- **`user.service.ts`**: Example service cho user endpoints

#### Components
- **`loading.component.ts`**: Component hiển thị loading spinner

## 2. Cách sử dụng

### 2.1. Thêm Loading Component vào App

Thêm vào `app.component.ts`:

\`\`\`typescript
import { Component } from '@angular/core';
import { LoadingComponent } from './shared/components/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingComponent],
  template: \`
    <app-loading />
    <router-outlet />
  \`
})
export class AppComponent {}
\`\`\`

### 2.2. Tạo Service mới

\`\`\`typescript
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from '../../core/services';

export interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiService = inject(ApiService);

  getProducts(): Observable<ApiResponse<Product[]>> {
    return this.apiService.get<ApiResponse<Product[]>>('/products');
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.apiService.get<ApiResponse<Product>>(\`/products/\${id}\`);
  }

  createProduct(data: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.apiService.post<ApiResponse<Product>>('/products', data);
  }

  updateProduct(id: number, data: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.apiService.put<ApiResponse<Product>>(\`/products/\${id}\`, data);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(\`/products/\${id}\`);
  }
}
\`\`\`

### 2.3. Sử dụng trong Component

\`\`\`typescript
import { Component, OnInit, signal } from '@angular/core';
import { ProductService, Product } from './services/product.service';

@Component({
  selector: 'app-products',
  template: \`
    <div class="p-4">
      <h1>Danh sách sản phẩm</h1>
      
      @if (error()) {
        <p class="text-red-500">{{ error() }}</p>
      }
      
      @for (product of products(); track product.id) {
        <div class="border p-4 mb-2">
          <h3>{{ product.name }}</h3>
          <p>{{ product.price | currency:'VND' }}</p>
        </div>
      }
    </div>
  \`
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  
  products = signal<Product[]>([]);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.products.set(response.data);
        }
      },
      error: (err) => {
        this.error.set(err.message);
      }
    });
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts(); // Reload list
      },
      error: (err) => {
        this.error.set(err.message);
      }
    });
  }
}
\`\`\`

### 2.4. Upload File

\`\`\`typescript
uploadAvatar(file: File) {
  this.apiService.upload<ApiResponse<{ url: string }>>(
    '/users/avatar', 
    file,
    { userId: 123 }
  ).subscribe({
    next: (response) => {
      console.log('Upload success:', response.data.url);
    },
    error: (err) => {
      console.error('Upload failed:', err);
    }
  });
}
\`\`\`

### 2.5. Skip Loading cho request cụ thể

\`\`\`typescript
// Không hiển thị loading spinner cho request này
this.apiService.get<ApiResponse<Data>>('/data', {}, true).subscribe(...);
\`\`\`

## 3. Environment Configuration

Đã cấu hình trong `environment.ts` và `environment.development.ts`:

\`\`\`typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
\`\`\`

## 4. Authentication Flow

1. **Login**: Lưu token vào localStorage
\`\`\`typescript
login(credentials: LoginRequest) {
  this.userService.login(credentials).subscribe({
    next: (response) => {
      localStorage.setItem('access_token', response.data.access_token);
      this.router.navigate(['/dashboard']);
    }
  });
}
\`\`\`

2. **Auto-attach token**: `auth.interceptor` tự động thêm token vào mọi request

3. **Handle 401**: `error.interceptor` tự động redirect về login khi token hết hạn

## 5. Error Handling

Interceptor tự động xử lý các lỗi phổ biến:
- 400: Bad Request
- 401: Unauthorized (auto redirect to login)
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## 6. Backend CORS đã được cấu hình

Trong `main.ts`:
\`\`\`typescript
app.enableCors({
  origin: ['http://localhost:4200'],
  credentials: true
});
\`\`\`

## 7. Lưu ý

- Tất cả response từ backend nên follow format: \`{ success: boolean, message: string, data: T }\`
- Loading spinner tự động hiển thị cho mọi request (trừ khi skip)
- Token được lưu trong localStorage và tự động gửi kèm request
- Cookies được gửi tự động (withCredentials: true)
