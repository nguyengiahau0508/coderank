# 📚 CodeRank API Documentation

## Tài liệu hệ thống API

### 📖 Các file documentation

1. **[API_SUMMARY.md](./API_SUMMARY.md)** ⭐ 
   - Tóm tắt toàn bộ API layer
   - Danh sách tất cả API services và methods
   - Quick reference

2. **[API_ARCHITECTURE.md](./API_ARCHITECTURE.md)**
   - Kiến trúc chi tiết
   - Hướng dẫn sử dụng đầy đủ
   - Best practices và patterns
   - Examples

3. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**
   - Hướng dẫn migrate từ HttpClient sang API services
   - Before/After examples
   - Step-by-step guide

4. **[API_USAGE.md](./API_USAGE.md)**
   - Hướng dẫn cơ bản về HTTP client
   - Interceptors usage
   - Authentication flow

## 🎯 Quick Start

### 1. Import API Service

```typescript
import { ProblemsApi } from '../../data/api';
```

### 2. Inject vào Component/Service

```typescript
@Component({...})
export class MyComponent {
  private readonly problemsApi = inject(ProblemsApi);
}
```

### 3. Gọi API

```typescript
this.problemsApi.getProblems({ page: 1, limit: 10 }).subscribe({
  next: (response) => {
    if (response.success) {
      console.log(response.data);
    }
  },
  error: (err) => {
    console.error(err.message);
  }
});
```

## 📦 Available API Services

| Service | Import | Description |
|---------|--------|-------------|
| AuthApi | `import { AuthApi } from '../../data/api'` | Authentication & OAuth |
| UsersApi | `import { UsersApi } from '../../data/api'` | User management |
| ProblemsApi | `import { ProblemsApi } from '../../data/api'` | Problems, testcases, hints, submissions |
| ContestsApi | `import { ContestsApi } from '../../data/api'` | Contests, participants, leaderboard |
| RunnerApi | `import { RunnerApi } from '../../data/api'` | Code execution |

## 🔑 Key Features

✅ **Type Safety** - Full TypeScript support  
✅ **Auto Authentication** - JWT token auto-attached  
✅ **Auto Loading** - Loading indicator tự động  
✅ **Error Handling** - Centralized error handling  
✅ **Consistent Format** - Unified response format  
✅ **Pagination Support** - Built-in pagination  
✅ **Injectable** - All services are injectable  

## 📂 Cấu trúc

```
src/app/
├── core/
│   ├── services/
│   │   ├── api.service.ts          # Base HTTP service
│   │   └── loading.service.ts      # Loading state
│   └── interceptors/
│       ├── auth.interceptor.ts     # JWT auto-attach
│       ├── error.interceptor.ts    # Error handling
│       └── loading.interceptor.ts  # Loading indicator
└── data/
    ├── api/                         # 🌟 API Layer
    │   ├── base.api.ts
    │   ├── auth.api.ts
    │   ├── users.api.ts
    │   ├── problems.api.ts
    │   ├── contests.api.ts
    │   ├── runner.api.ts
    │   └── index.ts
    ├── interfaces/
    │   ├── api-response.interface.ts
    │   └── paginated-response.interface.ts
    ├── constants/
    │   └── api.constants.ts
    ├── models/
    └── dto/
```

## 💡 Examples

### Get Paginated List
```typescript
problemsApi.getProblems({ page: 1, limit: 10 }).subscribe({
  next: (response: PaginatedResponse<ProblemsModel>) => {
    console.log(response.data);           // ProblemsModel[]
    console.log(response.meta.totalItems); // Total count
    console.log(response.meta.page);      // Current page
  }
});
```

### Create Item
```typescript
problemsApi.createProblem(dto).subscribe({
  next: (response: ApiResponse<ProblemsModel>) => {
    console.log(response.data); // Created problem
  }
});
```

### Upload File
```typescript
usersApi.uploadAvatar(file).subscribe({
  next: (response) => {
    console.log(response.data.url); // Avatar URL
  }
});
```

## 🔗 Related Files

- `src/environments/environment.ts` - API URL configuration
- `src/app/app.config.ts` - HTTP client & interceptors setup

## 📞 Support

Đọc các file documentation trên để biết chi tiết.

---

**Last Updated**: 2024
