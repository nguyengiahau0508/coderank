<p align="center">
  <img src="https://img.shields.io/badge/CodeRank_API-NestJS%2011-ea2845?style=for-the-badge&logo=nestjs&logoColor=white" alt="CodeRank API" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TypeORM-0.3-fe0902?style=flat-square" alt="TypeORM" />
  <img src="https://img.shields.io/badge/MariaDB-003545?style=flat-square&logo=mariadb&logoColor=white" alt="MariaDB" />
  <img src="https://img.shields.io/badge/BullMQ-5-ff6b35?style=flat-square" alt="BullMQ" />
  <img src="https://img.shields.io/badge/Passport-JWT%20%2B%20OAuth2-34e27a?style=flat-square" alt="Passport" />
  <img src="https://img.shields.io/badge/Swagger-OpenAPI-85ea2d?style=flat-square&logo=swagger&logoColor=black" alt="Swagger" />
</p>

# CodeRank API

Backend REST API for the CodeRank platform — a competitive programming and online learning system. Built with **NestJS 11**, **TypeORM**, and **MariaDB**.

---

## 📁 Project Structure

```
src/
├── main.ts                        # Application bootstrap & global setup
├── app.module.ts                  # Root module (imports all sub-modules)
├── app.controller.ts              # Root health-check controller
├── app.service.ts                 # Root service
│
├── auth/                          # 🔐 Authentication & Authorization
│   ├── auth.module.ts
│   ├── auth.controller.ts         # OAuth2 & JWT endpoints
│   ├── auth.service.ts            # Auth business logic
│   ├── strategies/                # Passport strategies
│   │   ├── google.strategy.ts     # Google OAuth2
│   │   ├── github.strategy.ts     # GitHub OAuth2
│   │   └── jwt.strategy.ts        # JWT validation
│   ├── guards/                    # Global guards
│   │   ├── jwt.guard.ts           # JWT authentication guard
│   │   ├── roles.guard.ts         # Role-based access guard
│   │   └── owner.guard.ts         # Resource ownership guard
│   └── decorators/                # Auth decorators
│       ├── current-user.decorator.ts
│       ├── roles.decorator.ts
│       ├── owner.decorator.ts
│       └── global.decorator.ts    # @Public() decorator
│
├── modules/                       # 📦 Feature Modules
│   ├── module.ts                  # Root feature module aggregator
│   ├── users/                     # User management
│   │   ├── services/              # UserService, TokenService, SessionService, AuthProviderService
│   │   ├── entities/              # User, Token, Session, AuthProvider entities
│   │   └── dto/
│   ├── problems/                  # Coding problems
│   │   ├── problems.controller.ts # 28 endpoints
│   │   ├── services/              # Problems, Testcases, Tags, Hints, Solutions, Submissions
│   │   ├── entities/
│   │   ├── dto/
│   │   └── listeners/             # Submission completion handler
│   ├── contests/                  # Programming contests
│   │   ├── contests.controller.ts # 20 endpoints
│   │   ├── services/              # Contests, ContestProblems, Participants, Submissions
│   │   ├── entities/
│   │   └── dto/
│   ├── courses/                   # LMS courses
│   │   ├── courses.controller.ts  # 56 endpoints
│   │   ├── services/              # 12 services (courses, sections, lessons, quizzes, ...)
│   │   ├── entities/              # 13 entities
│   │   └── dto/
│   └── runner/                    # Code execution engine
│       ├── runner.controller.ts   # 1 endpoint
│       ├── services/              # RunnerService, CheckerService
│       ├── processor/             # BullMQ job processor
│       ├── events/                # SubmissionCompletedEvent
│       └── dto/
│
├── common/                        # 🔧 Shared Utilities
│   ├── entities/                  # BaseEntity (UUID + timestamps + soft delete)
│   ├── services/                  # BaseService<T> (generic CRUD + pagination)
│   ├── dto/                       # PaginationQueryDto, ApiResponseDto, etc.
│   ├── enums/                     # 15+ enums (Roles, Difficulty, Language, Status, ...)
│   ├── interfaces/                # IRepository, IPaginatedResult, IJwtPayload, ...
│   ├── filters/                   # GlobalExceptionFilter
│   ├── interceptors/              # TransformInterceptor (response standardization)
│   ├── decorators/                # Swagger, @ResponseMessage(), @SkipTransform()
│   ├── exceptions/                # BusinessException with error codes
│   ├── helpers/                   # Username generation utilities
│   └── constants/                 # DB_TABLES, DB_CONSTRAINTS, COLORS
│
├── config/                        # ⚙️ Configuration
│   ├── config.module.ts           # Global config aggregator
│   ├── app/                       # App config (name, env, host, port, client URL)
│   └── swagger/                   # Swagger/OpenAPI setup
│
├── providers/                     # 🏭 Infrastructure Providers
│   ├── provider.module.ts         # Global provider aggregator
│   ├── db/                        # MariaDB (TypeORM) provider
│   ├── auth/                      # JWT provider
│   └── integrations/              # Throttler, BullMQ, EventEmitter providers
│
├── integrations/                  # 🔌 External Integrations
│   ├── integration.module.ts      # Global integration aggregator
│   └── local-storage/             # Local file storage service
│
├── db/                            # 🗄️ Database
│   ├── data-source.ts             # TypeORM data source configuration
│   └── seeds/                     # Database seeders
│
└── types/                         # TypeScript type augmentations
    └── express.d.ts
```

---

## 🏗️ Architecture

The application follows a **layered modular architecture** with five root-level modules:

```
AppModule
├── RootConfigModule       (Global) → App, JWT, DB, Google, GitHub configs
├── RootProviderModule     (Global) → MariaDB, JWT, Throttler, BullMQ, EventEmitter
├── RootIntegrationModule  (Global) → Google OAuth2, Google Drive, Local Storage
├── RootModule             → Users, Problems, Contests, Courses, Runner
└── AuthModule             (Global) → Strategies, Guards, Decorators
```

### Global Guard Chain

Every incoming request passes through 4 guards (in order):

```
Request → ThrottlerGuard → JwtAuthGuard → RolesGuard → OwnerGuard → Controller
```

| Guard | Purpose | Skip With |
|-------|---------|-----------|
| `ThrottlerGuard` | Rate limiting protection | — |
| `JwtAuthGuard` | JWT token validation | `@Public()` |
| `RolesGuard` | Role-based access check | `@Roles(...)` |
| `OwnerGuard` | Resource ownership check | `@Owner(...)` |

### Global Pipes, Filters & Interceptors

Configured in `main.ts`:

| Layer | Class | Purpose |
|-------|-------|---------|
| Pipe | `ValidationPipe` | Auto-validates DTOs (whitelist, transform, forbidNonWhitelisted) |
| Filter | `GlobalExceptionFilter` | Standardizes all error responses |
| Interceptor | `TransformInterceptor` | Wraps success responses in standard format |

---

## 🔐 Authentication

### OAuth2 Login Flow

```
Client                    Server                      Google
  │                         │                           │
  ├── GET /auth/google ────▶│                           │
  │                         ├── Redirect ──────────────▶│
  │                         │                           ├── User authenticates
  │                         │◀── Callback + user data ──┤
  │                         │                           │
  │                         ├── Create/validate user    │
  │                         ├── Generate JWT tokens     │
  │                         ├── Create session          │
  │◀── Redirect to client ─┤                           │
  │    with accessToken     │                           │
```

### Token Strategy

| Token | Expiry | Storage | Purpose |
|-------|--------|---------|---------|
| Access Token | 15 min | `Authorization: Bearer` header | API authentication |
| Refresh Token | 7 days | `httpOnly` cookie (`refreshToken`) | Token renewal |

### Auth Decorators

| Decorator | Usage |
|-----------|-------|
| `@Public()` | Skip JWT authentication |
| `@Roles(RolesEnum.Admin)` | Require specific role(s) |
| `@Owner()` | Require resource ownership |
| `@CurrentUser()` | Extract authenticated user from request |

---

## 📡 API Endpoints

> All routes are prefixed with `/api`. Swagger docs available at `/api-docs`.

### Auth (`/api/auth`) — 4 routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/auth/google` | Public | Initiate Google OAuth2 flow |
| `GET` | `/auth/google/callback` | Public | Handle Google OAuth2 callback |
| `GET` | `/auth/logout` | JWT | Logout and revoke tokens |
| `POST` | `/auth/refresh-tokens` | Public | Refresh tokens via cookie |

### Problems (`/api/problems`) — 28 routes

| Group | Method | Path | Description |
|-------|--------|------|-------------|
| **Problems** | `POST` | `/problems` | Create a problem |
| | `GET` | `/problems` | List all problems (paginated) |
| | `GET` | `/problems/me` | List current user's problems |
| | `GET` | `/problems/:problemId` | Get a specific problem |
| | `PATCH` | `/problems/:problemId` | Update a problem |
| | `DELETE` | `/problems/:problemId` | Delete a problem |
| **Testcases** | `POST` | `/problems/:id/testcases` | Create testcase |
| | `GET` | `/problems/:id/testcases` | List all testcases |
| | `GET` | `/problems/:id/testcases/sample` | List sample testcases |
| | `GET` | `/problems/:id/testcases/:tid` | Get a testcase |
| | `PATCH` | `/problems/:id/testcases/:tid` | Update a testcase |
| | `DELETE` | `/problems/:id/testcases/:tid` | Delete a testcase |
| **Tags** | `GET` | `/problems/tags` | List all tags |
| | `POST` | `/problems/:id/tags/:tagId` | Add tag to problem |
| | `DELETE` | `/problems/:id/tags/:tagId` | Remove tag from problem |
| **Hints** | `POST` | `/problems/:id/hints` | Create a hint |
| | `GET` | `/problems/:id/hints` | List hints |
| | `GET` | `/problems/:id/hints/:hid` | Get a hint |
| | `PATCH` | `/problems/:id/hints/:hid` | Update a hint |
| | `DELETE` | `/problems/:id/hints/:hid` | Delete a hint |
| **Submissions** | `POST` | `/problems/:id/submissions` | Submit solution |
| | `GET` | `/problems/:id/submissions` | List user's submissions |
| | `GET` | `/problems/:id/submissions/:sid` | Get submission details |
| **Solutions** | `POST` | `/problems/:id/solutions` | Create editorial |
| | `GET` | `/problems/:id/solutions` | List solutions |
| | `GET` | `/problems/:id/solutions/me` | List own solutions |
| | `GET` | `/problems/:id/solutions/:sid` | Get a solution |
| | `PATCH` | `/problems/:id/solutions/:sid` | Update a solution |
| | `DELETE` | `/problems/:id/solutions/:sid` | Delete a solution |

### Contests (`/api/contests`) — 20 routes

| Group | Method | Path | Description |
|-------|--------|------|-------------|
| **Contests** | `POST` | `/contests` | Create a contest |
| | `GET` | `/contests` | List contests (paginated) |
| | `GET` | `/contests/:id` | Get a contest |
| | `PATCH` | `/contests/:id` | Update a contest |
| | `DELETE` | `/contests/:id` | Delete a contest |
| **Problems** | `POST` | `/contests/:id/problems` | Add problem |
| | `GET` | `/contests/:id/problems` | List contest problems |
| | `GET` | `/contests/:id/problems/:pid` | Get a contest problem |
| | `PATCH` | `/contests/:id/problems/:pid` | Update settings |
| | `DELETE` | `/contests/:id/problems/:pid` | Remove problem |
| **Participants** | `POST` | `/contests/:id/join` | Join contest |
| | `POST` | `/contests/:id/leave` | Leave contest |
| | `GET` | `/contests/:id/participants` | List participants |
| | `GET` | `/contests/:id/leaderboard` | Get leaderboard |
| | `DELETE` | `/contests/:id/participants/:uid` | Remove participant |
| **Submissions** | `POST` | `/contests/:id/problems/:pid/submit` | Submit solution |
| | `GET` | `/contests/:id/submissions` | List my submissions |
| | `GET` | `/contests/:id/problems/:pid/submissions` | My submissions per problem |
| | `GET` | `/contests/:id/submissions/:sid` | Get submission detail |
| | `GET` | `/contests/:id/all-submissions` | All submissions (admin) |

### Courses (`/api/courses`) — 56 routes

| Group | Endpoints | Description |
|-------|-----------|-------------|
| **Courses** | 7 routes | CRUD + duplicate + list own courses |
| **Sections** | 5 routes | CRUD within a course |
| **Lessons** | 5 routes | CRUD within a section |
| **Lesson Problems** | 4 routes | Add/update/remove practice problems |
| **Quizzes** | 5 routes | CRUD within a lesson |
| **Quiz Questions** | 5 routes | CRUD within a quiz |
| **Quiz Attempts** | 3 routes | Submit and review attempts |
| **Enrollments** | 4 routes | Enroll, unenroll, list, check status |
| **Lesson Progress** | 2 routes | Mark complete, get progress |
| **Reviews** | 4 routes | CRUD course reviews |
| **Assignments** | 5 routes | CRUD with file upload |
| **Assignment Submissions** | 7 routes | Submit, grade, download, list |

### Runner (`/api/runner`) — 1 route

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/runner/run` | Execute code and return results |

### Response Format

All success responses are standardized:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 },
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/problems"
}
```

All error responses:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found",
  "error": "NotFoundException",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/problems/123",
  "method": "GET"
}
```

---

## 🗄️ Database

### Entity Map

| Module | Entities |
|--------|----------|
| Users | `UsersEntity`, `TokensEntity`, `SessionsEntity`, `AuthProvidersEntity` |
| Problems | `ProblemsEntity`, `TestcasesEntity`, `TagsEntity`, `HintsEntity`, `SolutionsEntity`, `SubmissionsEntity` |
| Contests | `ContestsEntity`, `ContestProblemsEntity`, `ContestParticipantsEntity`, `ContestSubmissionsEntity` |
| Courses | `CoursesEntity`, `CourseSectionsEntity`, `CourseLessonsEntity`, `CourseEnrollmentsEntity`, `CourseLessonProgressEntity`, `CourseQuizzesEntity`, `CourseQuizQuestionsEntity`, `CourseQuizAttemptsEntity`, `CourseLessonProblemsEntity`, `CourseReviewsEntity`, `CourseAssignmentsEntity`, `CourseAssignmentSubmissionsEntity` |

### Base Entity

All entities extend `BaseEntity` which provides:

```typescript
{
  id: string;          // UUID (auto-generated)
  createdAt: Date;     // Auto timestamp
  updatedAt: Date;     // Auto timestamp
  deletedAt: Date;     // Soft delete (nullable)
  authorId: string;    // Creator reference (nullable)
}
```

### Seeding

```bash
npm run seed    # Runs src/db/seeds/seed.ts with @faker-js/faker
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Application
APP_NAME=coderank-api
APP_ENV=development          # development | production
APP_HOST=0.0.0.0
APP_PORT=3000
CLIENT_URL=http://localhost:4200

# Database (MariaDB)
DB_MARIADB_HOST=localhost
DB_MARIADB_PORT=3306
DB_MARIADB_USERNAME=root
DB_MARIADB_PASSWORD=your_password
DB_MARIADB_NAME=coderank

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=15m

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# GitHub OAuth2 (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
```

---

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run start:dev    # Watch mode with hot reload
```

### Production

```bash
npm run build
npm run start:prod
```

### Testing

```bash
npm test             # Unit tests (Jest)
npm run test:e2e     # E2E tests (Supertest)
npm run test:cov     # Coverage report
```

### Linting & Formatting

```bash
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting
```

---

## 📜 All Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `nest start` | Start server |
| `start:dev` | `nest start --watch` | Dev server with hot reload |
| `start:debug` | `nest start --debug --watch` | Debug mode |
| `start:prod` | `node dist/main` | Production server |
| `build` | `nest build` | Build for production |
| `lint` | `eslint "{src,apps,libs,test}/**/*.ts" --fix` | Lint & auto-fix |
| `format` | `prettier --write "src/**/*.ts" "test/**/*.ts"` | Format code |
| `test` | `jest` | Unit tests |
| `test:watch` | `jest --watch` | Unit tests (watch) |
| `test:cov` | `jest --coverage` | Test coverage |
| `test:debug` | `node --inspect-brk jest --runInBand` | Debug tests |
| `test:e2e` | `jest --config ./test/jest-e2e.json` | E2E tests |
| `seed` | `ts-node ... src/db/seeds/seed.ts` | Seed database |

---

## 🔧 Key Patterns

| Pattern | Description |
|---------|-------------|
| **Service Inheritance** | All services extend `BaseService<T>` with `findById()`, `findAll()`, `create()`, `update()`, `delete()`, `softDelete()`, `paginate()`, `transaction()` |
| **Entity Inheritance** | All entities extend `BaseEntity` (UUID + timestamps + soft delete) |
| **Global Guard Chain** | ThrottlerGuard → JwtAuthGuard → RolesGuard → OwnerGuard |
| **Response Standardization** | `TransformInterceptor` wraps all responses; use `@SkipTransform()` to bypass |
| **Business Exceptions** | Typed `BusinessException` subclasses with categorized error codes (1xxx–9xxx) |
| **Event-Driven** | Code execution results emitted as `SubmissionCompletedEvent` and handled by listeners |
| **Configuration** | Each config area has its own module with Joi validation and injectable service |
| **Pagination** | Query params: `page`, `limit`, `sortBy`, `sortOrder`, `search` |

---

## 📄 License

**UNLICENSED** — Private project. Part of the [CodeRank](../README.md) monorepo.
