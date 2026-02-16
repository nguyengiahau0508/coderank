# Hướng dẫn sử dụng API Layer - CodeRank

## 📁 Cấu trúc thư mục

```
src/app/
├── core/
│   ├── services/
│   │   ├── api.service.ts          # Base HTTP service (GET, POST, PUT, PATCH, DELETE, Upload)
│   │   └── loading.service.ts      # Loading state management
│   └── interceptors/
│       ├── auth.interceptor.ts     # Auto-attach JWT token
│       ├── error.interceptor.ts    # Global error handling
│       └── loading.interceptor.ts  # Loading indicator
├── data/
│   ├── api/                        # ✨ API Layer (Tầng gọi API)
│   │   ├── base.api.ts            # Base class cho tất cả API services
│   │   ├── auth.api.ts            # Authentication API
│   │   ├── users.api.ts           # Users API
│   │   ├── problems.api.ts        # Problems API
│   │   ├── contests.api.ts        # Contests API
│   │   ├── runner.api.ts          # Code Runner API
│   │   └── index.ts               # Barrel exports
│   ├── models/                     # Data models
│   ├── dto/                        # Data Transfer Objects
│   ├── interfaces/                 # TypeScript interfaces
│   │   ├── api-response.interface.ts    # Standard response
│   │   └── paginated-response.interface.ts  # Paginated response
│   ├── constants/
│   │   └── api.constants.ts       # API endpoints & constants
│   └── enums/
└── features/
    └── {feature}/
        └── services/               # Business logic services (sử dụng API layer)
```

## 🎯 Kiến trúc phân tầng

### 1. Core Layer (HTTP Base)
- **ApiService**: Base HTTP client với GET/POST/PUT/PATCH/DELETE/Upload
- **Interceptors**: Auth, Error handling, Loading

### 2. Data Layer (API Services)
- **BaseApi**: Abstract class kế thừa từ ApiService
- **Specific APIs**: AuthApi, UsersApi, ProblemsApi, ContestsApi, RunnerApi
- Tất cả đều kế thừa từ BaseApi và sử dụng ApiService

### 3. Feature Layer (Business Logic)
- Services trong features sử dụng API services từ Data layer
- Xử lý business logic, state management

## 📝 Quy ước Response Format

Tất cả API đều trả về theo format thống nhất (đồng bộ với backend):

### Single Item Response
```typescript
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, any>;
  timestamp: string;
  path: string;
}
```

### Paginated Response
```typescript
interface PaginatedResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  timestamp: string;
  path: string;
}
```

## 🚀 Cách sử dụng

### 1. Sử dụng API Services trực tiếp

```typescript
import { Component, signal, inject } from '@angular/core';
import { ProblemsApi } from '../../data/api';
import { ProblemsModel } from '../../data/models/problems.model';

@Component({
  selector: 'app-problems-list',
  template: `
    @if (error()) {
      <p class="text-red-500">{{ error() }}</p>
    }
    
    @for (problem of problems(); track problem.id) {
      <div>{{ problem.title }}</div>
    }
  `
})
export class ProblemsListComponent {
  private readonly problemsApi = inject(ProblemsApi);
  
  problems = signal<ProblemsModel[]>([]);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadProblems();
  }

  loadProblems() {
    this.problemsApi.getProblems({ page: 1, limit: 10 }).subscribe({
      next: (response) => {
        if (response.success) {
          this.problems.set(response.data);
        }
      },
      error: (err) => {
        this.error.set(err.message);
      }
    });
  }

  createProblem(data: CreateProblemDto) {
    this.problemsApi.createProblem(data).subscribe({
      next: (response) => {
        console.log('Created:', response.data);
        this.loadProblems();
      },
      error: (err) => {
        this.error.set(err.message);
      }
    });
  }
}
```

### 2. Tạo Business Logic Service

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { ProblemsApi } from '../../../data/api';
import { ProblemsModel } from '../../../data/models/problems.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProblemsService {
  private readonly problemsApi = inject(ProblemsApi);
  
  // State management
  problems = signal<ProblemsModel[]>([]);
  selectedProblem = signal<ProblemsModel | null>(null);
  loading = signal(false);

  /**
   * Load problems with caching
   */
  loadProblems(params?: any): Observable<PaginatedResponse<ProblemsModel>> {
    this.loading.set(true);
    return this.problemsApi.getProblems(params).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.problems.set(response.data);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  /**
   * Create problem và auto refresh list
   */
  createProblem(data: CreateProblemDto) {
    return this.problemsApi.createProblem(data).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            // Refresh list
            this.loadProblems().subscribe();
          }
        }
      })
    );
  }

  /**
   * Select a problem
   */
  selectProblem(problemId: string) {
    this.problemsApi.getProblem(problemId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedProblem.set(response.data);
        }
      }
    });
  }
}
```

### 3. Sử dụng Business Logic Service trong Component

```typescript
import { Component, inject } from '@angular/core';
import { ProblemsService } from './services/problems.service';

@Component({
  selector: 'app-problems',
  template: `
    @if (problemsService.loading()) {
      <p>Loading...</p>
    }
    
    @for (problem of problemsService.problems(); track problem.id) {
      <div (click)="selectProblem(problem.id)">
        {{ problem.title }}
      </div>
    }
    
    @if (problemsService.selectedProblem(); as selected) {
      <div class="details">
        <h2>{{ selected.title }}</h2>
        <p>{{ selected.description }}</p>
      </div>
    }
  `
})
export class ProblemsComponent {
  readonly problemsService = inject(ProblemsService);

  ngOnInit() {
    this.problemsService.loadProblems().subscribe();
  }

  selectProblem(id: string) {
    this.problemsService.selectProblem(id);
  }
}
```

## 📚 Các API Services có sẵn

### 1. AuthApi
```typescript
authApi.loginWithGoogle()                    // Redirect to Google OAuth
authApi.loginWithGithub()                    // Redirect to GitHub OAuth
authApi.refreshToken()                       // Refresh access token
authApi.logout()                             // Logout user
```

### 2. UsersApi
```typescript
usersApi.getProfile()                        // Get current user
usersApi.updateProfile(dto)                  // Update profile
usersApi.getUser(userId)                     // Get user by ID
usersApi.getUsers(params)                    // Get paginated users (Admin)
usersApi.uploadAvatar(file)                  // Upload avatar
```

### 3. ProblemsApi
```typescript
// Problems
problemsApi.createProblem(dto)
problemsApi.getProblem(id)
problemsApi.getProblems(params)
problemsApi.updateProblem(id, dto)
problemsApi.deleteProblem(id)

// Testcases
problemsApi.createTestcase(problemId, dto)
problemsApi.getTestcases(problemId)
problemsApi.updateTestcase(problemId, testcaseId, dto)
problemsApi.deleteTestcase(problemId, testcaseId)

// Hints
problemsApi.createHint(problemId, dto)
problemsApi.getHints(problemId)
problemsApi.updateHint(problemId, hintId, dto)
problemsApi.deleteHint(problemId, hintId)

// Submissions
problemsApi.submitSolution(problemId, dto)
problemsApi.getSubmissions(problemId)

// Tags
problemsApi.addTag(problemId, tagId)
problemsApi.removeTag(problemId, tagId)
```

### 4. ContestsApi
```typescript
// Contests
contestsApi.createContest(dto)
contestsApi.getContest(id)
contestsApi.getContests(params)
contestsApi.updateContest(id, dto)
contestsApi.deleteContest(id)

// Contest Problems
contestsApi.addProblemToContest(contestId, dto)
contestsApi.getContestProblems(contestId)
contestsApi.updateContestProblem(contestId, problemId, dto)
contestsApi.removeProblemFromContest(contestId, problemId)

// Participants
contestsApi.joinContest(contestId)
contestsApi.getContestParticipants(contestId)
contestsApi.leaveContest(contestId)

// Submissions
contestsApi.submitContestSolution(contestId, dto)
contestsApi.getMyContestSubmissions(contestId)
contestsApi.getContestLeaderboard(contestId)
```

### 5. RunnerApi
```typescript
runnerApi.runCode({
  code: 'console.log("Hello")',
  language: 'javascript',
  input: '',
  timeLimit: 5000,
  memoryLimit: 128
})
```

## 🔐 Authentication Flow

1. **Login**: Redirect to OAuth provider
```typescript
authApi.loginWithGoogle();  // Redirect
```

2. **Token được lưu tự động**: Auth interceptor tự động attach vào mọi request

3. **Refresh token tự động**: Khi token hết hạn (401), error interceptor sẽ:
   - Xóa token
   - Redirect về login

## ⚙️ Configuration

### Environment
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### App Config
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,       // Auto-attach token
        loadingInterceptor,    // Show loading
        errorInterceptor       // Handle errors
      ])
    )
  ]
};
```

## 🎨 Best Practices

### ✅ DO:
- Sử dụng API services từ `data/api`
- Tạo business logic services trong `features/{feature}/services`
- Sử dụng signals cho state management
- Handle errors properly
- Use TypeScript types từ `data/models` và `data/dto`

### ❌ DON'T:
- Gọi HttpClient trực tiếp trong components
- Duplicate API logic
- Ignore error handling
- Hardcode API endpoints (dùng constants)

## 📊 Error Handling

Errors được xử lý tự động bởi `error.interceptor`:
- **400**: Bad Request
- **401**: Unauthorized → Auto redirect to login
- **403**: Forbidden
- **404**: Not Found
- **500**: Server Error

```typescript
this.problemsApi.getProblem('123').subscribe({
  next: (response) => {
    // Success
  },
  error: (err) => {
    // err.status: HTTP status code
    // err.message: User-friendly message (Vietnamese)
    console.error(err.message);
  }
});
```

## 🔄 Loading State

Loading tự động được quản lý bởi `loading.interceptor`:

```typescript
// In component template
<app-loading />  <!-- Shows spinner during API calls -->

// Or access manually
loadingService.isLoading()  // Signal<boolean>
```

Skip loading cho specific request:
```typescript
this.apiService.get('/data', {}, true)  // skipLoading = true
```

## 📖 Type Safety

Tất cả responses đều có types đầy đủ:

```typescript
// Auto-complete và type checking
this.problemsApi.getProblems().subscribe({
  next: (response: PaginatedResponse<ProblemsModel>) => {
    response.data        // ProblemsModel[]
    response.meta.page   // number
    response.success     // boolean
  }
});
```

## 🌐 API Constants

Sử dụng constants thay vì hardcode:

```typescript
import { API_ENDPOINTS, PAGINATION_DEFAULTS } from '../../data/constants';

// Instead of: '/problems'
// Use: API_ENDPOINTS.PROBLEMS.BASE

// Instead of: page: 1, limit: 10
// Use: PAGINATION_DEFAULTS.PAGE, PAGINATION_DEFAULTS.LIMIT
```

---

**Lưu ý**: File này được tạo tự động. Cập nhật khi có thay đổi về API structure.
