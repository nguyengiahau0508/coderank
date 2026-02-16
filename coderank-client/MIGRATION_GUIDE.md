# Hướng dẫn Migration sang API Layer mới

## 🎯 Mục tiêu

Chuyển từ việc gọi `HttpClient` trực tiếp sang sử dụng **API Services** thống nhất.

## 📋 Checklist Migration

### 1. Components đang gọi HttpClient trực tiếp

**❌ TRƯỚC (Anti-pattern):**
```typescript
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({...})
export class ProblemsComponent {
  private http = inject(HttpClient);

  loadProblems() {
    this.http.get(`${environment.apiUrl}/problems`).subscribe({
      next: (data) => console.log(data)
    });
  }
}
```

**✅ SAU (Recommended):**
```typescript
import { ProblemsApi } from '../../data/api';

@Component({...})
export class ProblemsComponent {
  private problemsApi = inject(ProblemsApi);

  loadProblems() {
    this.problemsApi.getProblems().subscribe({
      next: (response) => {
        if (response.success) {
          console.log(response.data);
        }
      }
    });
  }
}
```

### 2. Update AuthApi usage

**❌ TRƯỚC:**
```typescript
loginWithGoogle() {
  window.location.href = `${environment.apiUrl}/auth/google`;
}
```

**✅ SAU:**
```typescript
import { AuthApi } from '../../data/api';

loginWithGoogle() {
  this.authApi.loginWithGoogle();
}
```

### 3. Update ProblemsApi usage

**❌ TRƯỚC:**
```typescript
// Get single problem
this.http.get<ProblemsModel>(`${environment.apiUrl}/problems/${id}`)

// Get list with pagination
const params = new HttpParams()
  .set('page', '1')
  .set('limit', '10');
this.http.get(`${environment.apiUrl}/problems`, { params })

// Create problem
this.http.post(`${environment.apiUrl}/problems`, dto)
```

**✅ SAU:**
```typescript
import { ProblemsApi } from '../../data/api';

// Get single problem
this.problemsApi.getProblem(id)

// Get list with pagination
this.problemsApi.getProblems({ page: 1, limit: 10 })

// Create problem
this.problemsApi.createProblem(dto)
```

### 4. Handle Response Format

**Response format đã thay đổi:**

```typescript
// Backend trả về
{
  success: true,
  statusCode: 200,
  message: "Success",
  data: {...},  // hoặc [] cho list
  meta: {...},  // cho paginated response
  timestamp: "2024-...",
  path: "/api/problems"
}

// Access data
response.data           // Actual data
response.meta.page      // Pagination info (if paginated)
response.success        // Check success
```

### 5. Error Handling

**Errors được xử lý tự động:**

```typescript
this.problemsApi.getProblem(id).subscribe({
  error: (err) => {
    // err.status: 400, 401, 403, 404, 500
    // err.message: User-friendly Vietnamese message
    // err.originalError: Original HTTP error
    
    console.error(err.message); // "Không tìm thấy tài nguyên"
  }
});
```

## 🔧 Cập nhật từng module

### Auth Module
```typescript
// old: auth.api.ts (class without @Injectable)
export class AuthApi {
  private http = inject(HttpClient);
}

// new: Đã update thành @Injectable và kế thừa BaseApi
@Injectable({ providedIn: 'root' })
export class AuthApi extends BaseApi {
  protected readonly endpoint = '/auth';
}

// Usage
import { AuthApi } from '../../data/api';
private authApi = inject(AuthApi);
```

### Problems Module
```typescript
// All methods now return ApiResponse<T> or PaginatedResponse<T>
this.problemsApi.getProblems({ page: 1, limit: 10 })
  .subscribe({
    next: (response: PaginatedResponse<ProblemsModel>) => {
      response.data;              // ProblemsModel[]
      response.meta.totalItems;   // number
      response.meta.page;         // number
    }
  });
```

### Contests Module
```typescript
import { ContestsApi } from '../../data/api';
private contestsApi = inject(ContestsApi);

// Tất cả methods đã available
this.contestsApi.getContests({ page: 1 });
this.contestsApi.joinContest(contestId);
this.contestsApi.getContestLeaderboard(contestId);
```

### Runner Module
```typescript
import { RunnerApi } from '../../data/api';
private runnerApi = inject(RunnerApi);

this.runnerApi.runCode({
  code: sourceCode,
  language: 'javascript',
  input: testInput
}).subscribe({
  next: (response) => {
    console.log(response.data.output);
  }
});
```

## 📝 Steps để migrate một feature

1. **Identify API calls** trong component/service
2. **Import appropriate API service**
3. **Replace HttpClient calls** với API service methods
4. **Update response handling** (check `response.success` và `response.data`)
5. **Test thoroughly**

## 🎨 Patterns

### Pattern 1: Direct API usage in Component
```typescript
@Component({...})
export class ListComponent {
  private api = inject(ProblemsApi);
  items = signal<ProblemsModel[]>([]);

  ngOnInit() {
    this.api.getProblems().subscribe({
      next: (res) => res.success && this.items.set(res.data)
    });
  }
}
```

### Pattern 2: Business Logic Service (Recommended)
```typescript
// Feature service
@Injectable({ providedIn: 'root' })
export class ProblemsService {
  private api = inject(ProblemsApi);
  problems = signal<ProblemsModel[]>([]);

  loadProblems() {
    return this.api.getProblems().pipe(
      tap(res => res.success && this.problems.set(res.data))
    );
  }
}

// Component
@Component({...})
export class ListComponent {
  service = inject(ProblemsService);

  ngOnInit() {
    this.service.loadProblems().subscribe();
  }
}
```

## ✨ Benefits

1. **Type Safety**: Full TypeScript support
2. **Consistency**: Tất cả API calls follow same pattern
3. **Auto Features**: Auth, Loading, Error handling
4. **Maintainability**: Centralized API logic
5. **Testing**: Easy to mock API services
6. **Documentation**: Self-documenting code

## 🚀 Next Steps

1. Migrate existing components sang API services
2. Xóa các HttpClient imports không cần thiết
3. Update tests để mock API services
4. Review và optimize

## 📚 Resources

- `API_ARCHITECTURE.md` - Chi tiết về kiến trúc
- `API_SUMMARY.md` - Tóm tắt tất cả APIs
- `API_USAGE.md` - Hướng dẫn HTTP client cơ bản
