# CodeRank API Layer - Tóm tắt

## ✅ Đã hoàn thành

### 1. Cấu trúc thống nhất
```
data/
├── api/                    # API Services (Injectable)
│   ├── base.api.ts        # Base class cho tất cả APIs
│   ├── auth.api.ts        # Authentication
│   ├── users.api.ts       # Users management
│   ├── problems.api.ts    # Problems, testcases, hints, submissions
│   ├── contests.api.ts    # Contests, participants, leaderboard
│   ├── runner.api.ts      # Code execution
│   └── index.ts           # Barrel exports
├── interfaces/
│   ├── api-response.interface.ts       # Single item response
│   └── paginated-response.interface.ts # Paginated response
├── constants/
│   └── api.constants.ts   # API endpoints & constants
├── models/                 # Data models (already exists)
└── dto/                    # DTOs (already exists)
```

### 2. Response Types chuẩn hóa

**ApiResponse<T>** - Single item:
```typescript
{
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, any>;
  timestamp: string;
  path: string;
}
```

**PaginatedResponse<T>** - Paginated list:
```typescript
{
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

### 3. Tất cả API Services

#### AuthApi (@Injectable)
- `loginWithGoogle()` - OAuth Google
- `loginWithGithub()` - OAuth GitHub  
- `refreshToken()` - Refresh access token
- `logout()` - Logout user

#### UsersApi (@Injectable)
- `getProfile()` - Get current user
- `updateProfile(dto)` - Update profile
- `getUser(id)` - Get user by ID
- `getUsers(params)` - Paginated users (Admin)
- `uploadAvatar(file)` - Upload avatar

#### ProblemsApi (@Injectable)
**Problems:**
- `createProblem(dto)` - Create problem
- `getProblem(id)` - Get single problem
- `getProblems(params)` - Paginated problems
- `updateProblem(id, dto)` - Update problem
- `deleteProblem(id)` - Delete problem

**Testcases:**
- `createTestcase(problemId, dto)`
- `getTestcases(problemId)`
- `getTestcase(problemId, testcaseId)`
- `updateTestcase(problemId, testcaseId, dto)`
- `deleteTestcase(problemId, testcaseId)`

**Tags:**
- `addTag(problemId, tagId)`
- `removeTag(problemId, tagId)`

**Hints:**
- `createHint(problemId, dto)`
- `getHints(problemId)`
- `getHint(problemId, hintId)`
- `updateHint(problemId, hintId, dto)`
- `deleteHint(problemId, hintId)`

**Submissions:**
- `submitSolution(problemId, dto)`
- `getSubmissions(problemId)`

#### ContestsApi (@Injectable)
**Contests:**
- `createContest(dto)` - Create contest
- `getContest(id)` - Get single contest
- `getContests(params)` - Paginated contests
- `updateContest(id, dto)` - Update contest
- `deleteContest(id)` - Delete contest

**Problems:**
- `addProblemToContest(contestId, dto)`
- `getContestProblems(contestId)`
- `updateContestProblem(contestId, problemId, dto)`
- `removeProblemFromContest(contestId, problemId)`

**Participants:**
- `joinContest(contestId)` - Join contest
- `getContestParticipants(contestId)` - Get participants
- `leaveContest(contestId)` - Leave contest

**Submissions:**
- `submitContestSolution(contestId, dto)`
- `getMyContestSubmissions(contestId)`
- `getContestLeaderboard(contestId)` - Get leaderboard

#### RunnerApi (@Injectable)
- `runCode(dto)` - Execute code

### 4. Core Infrastructure

**ApiService** (core/services/):
- `get<T>(endpoint, params?, skipLoading?)`
- `post<T>(endpoint, body, skipLoading?)`
- `put<T>(endpoint, body, skipLoading?)`
- `patch<T>(endpoint, body, skipLoading?)`
- `delete<T>(endpoint, skipLoading?)`
- `upload<T>(endpoint, file, additionalData?, skipLoading?)`

**Interceptors** (core/interceptors/):
- `authInterceptor` - Auto-attach JWT token
- `errorInterceptor` - Handle HTTP errors
- `loadingInterceptor` - Show/hide loading

### 5. Constants

```typescript
API_ENDPOINTS.AUTH.BASE          // '/auth'
API_ENDPOINTS.USERS.PROFILE      // '/users/profile'
API_ENDPOINTS.PROBLEMS.BASE      // '/problems'
API_ENDPOINTS.CONTESTS.BASE      // '/contests'
API_ENDPOINTS.RUNNER.RUN         // '/runner/run'

PAGINATION_DEFAULTS.PAGE         // 1
PAGINATION_DEFAULTS.LIMIT        // 10
HTTP_STATUS.OK                   // 200
```

## 📖 Documentation

- **API_ARCHITECTURE.md** - Hướng dẫn chi tiết về kiến trúc và cách sử dụng
- **API_USAGE.md** - Hướng dẫn cơ bản về HTTP client và interceptors

## 🎯 Cách sử dụng

### Import và sử dụng
```typescript
import { Component, inject } from '@angular/core';
import { ProblemsApi } from '../../data/api';

@Component({...})
export class MyComponent {
  private readonly problemsApi = inject(ProblemsApi);

  loadData() {
    this.problemsApi.getProblems({ page: 1, limit: 10 }).subscribe({
      next: (response) => {
        if (response.success) {
          console.log(response.data);      // ProblemsModel[]
          console.log(response.meta.page); // 1
        }
      },
      error: (err) => {
        console.error(err.message); // User-friendly error
      }
    });
  }
}
```

### Tất cả APIs đều:
✅ Injectable (providedIn: 'root')  
✅ Kế thừa từ BaseApi  
✅ Sử dụng ApiService  
✅ Có proper TypeScript types  
✅ Auto JWT token attachment  
✅ Auto loading indicator  
✅ Auto error handling  
✅ Response format thống nhất với backend

## 🔄 Migration từ code cũ

**Trước:**
```typescript
private http = inject(HttpClient);
this.http.get(`${environment.apiUrl}/problems/${id}`)
```

**Sau:**
```typescript
private problemsApi = inject(ProblemsApi);
this.problemsApi.getProblem(id)
```

**Lợi ích:**
- Type safety
- Auto error handling
- Auto loading
- Auto auth
- Consistent response format
- Centralized API logic
