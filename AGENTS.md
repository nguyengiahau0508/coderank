# AGENTS.md — CodeRank Project Handover Document

> **Last updated:** 2026-03-04
> **Purpose:** Comprehensive handover guide for developers and AI agents to quickly understand and work with the CodeRank project.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Repository Structure](#2-repository-structure)
- [3. Tech Stack](#3-tech-stack)
- [4. Backend — coderank-api](#4-backend--coderank-api)
  - [4.1 Architecture](#41-architecture)
  - [4.2 Module Organization](#42-module-organization)
  - [4.3 Authentication & Authorization](#43-authentication--authorization)
  - [4.4 Database](#44-database)
  - [4.5 Common Layer](#45-common-layer)
  - [4.6 Feature Modules](#46-feature-modules)
  - [4.7 Integrations & Providers](#47-integrations--providers)
  - [4.8 Configuration](#48-configuration)
  - [4.9 API Conventions](#49-api-conventions)
- [5. Frontend — coderank-client](#5-frontend--coderank-client)
  - [5.1 Architecture](#51-architecture)
  - [5.2 Core Layer](#52-core-layer)
  - [5.3 Data Layer](#53-data-layer)
  - [5.4 Feature Modules](#54-feature-modules)
  - [5.5 Layouts & Shared Components](#55-layouts--shared-components)
  - [5.6 Styling & Theming](#56-styling--theming)
- [6. Development Workflow](#6-development-workflow)
  - [6.1 Getting Started](#61-getting-started)
  - [6.2 Available Scripts](#62-available-scripts)
  - [6.3 Testing](#63-testing)
  - [6.4 Linting & Formatting](#64-linting--formatting)
- [7. Key Patterns & Conventions](#7-key-patterns--conventions)
- [8. Environment & Configuration](#8-environment--configuration)
- [9. Known Considerations](#9-known-considerations)
- [10. Useful References](#10-useful-references)

---

## 1. Project Overview

**CodeRank** is a full-stack competitive programming and online learning platform. It supports:

- **Coding Problems** — CRUD with testcases, hints, solutions, submissions, and automated judging
- **Contests** — Timed programming contests with participants, submissions, and leaderboards
- **Courses** — LMS features with sections, lessons (video/text/quiz/practice), quizzes, assignments, enrollments, and reviews
- **Code Runner** — Background code execution engine with BullMQ job queue and result checking
- **Role-based Access** — Three user roles: `admin`, `instructor` (lecturer), `student`

**License:** UNLICENSED (Private project)

---

## 2. Repository Structure

```
coderank/                          # Monorepo root
├── README.md                      # Project overview & setup instructions
├── AGENTS.md                      # This handover document
├── coderank-api/                  # NestJS Backend API
│   ├── src/
│   │   ├── main.ts                # Application bootstrap & global setup
│   │   ├── app.module.ts          # Root module with global guards
│   │   ├── app.controller.ts      # Root controller
│   │   ├── app.service.ts         # Root service
│   │   ├── auth/                  # Authentication module
│   │   ├── common/                # Shared utilities (base classes, DTOs, filters, etc.)
│   │   ├── config/                # Configuration modules (app, db, jwt, integrations)
│   │   ├── db/                    # Database data-source & seeders
│   │   ├── integrations/          # External service integrations
│   │   ├── modules/               # Feature modules (users, problems, contests, courses, runner)
│   │   ├── providers/             # Infrastructure providers (db, jwt, bullmq, throttler)
│   │   └── types/                 # TypeScript type augmentations
│   ├── test/                      # E2E tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── eslint.config.mjs
│   └── .prettierrc
└── coderank-client/               # Angular Frontend Application
    ├── src/
    │   ├── main.ts                # Application bootstrap
    │   ├── index.html             # HTML entry point
    │   ├── styles.css             # Global styles (TailwindCSS 4 + overrides)
    │   ├── environments/          # Environment configs (dev/prod)
    │   └── app/
    │       ├── app.ts             # Root component
    │       ├── app.config.ts      # App providers configuration
    │       ├── app.routes.ts      # Root routes with lazy loading
    │       ├── core/              # Guards, interceptors, core services
    │       ├── data/              # API services, DTOs, models, enums, constants
    │       ├── features/          # Feature modules (admin, lecturer, student, auth)
    │       ├── layouts/           # Layout components per role
    │       └── shared/            # Reusable components
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    ├── VISUAL_REFERENCE.md        # ASCII design reference guide
    └── .postcssrc.json
```

---

## 3. Tech Stack

### Backend (coderank-api)

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | NestJS | 11.x |
| Language | TypeScript | 5.7.x |
| Database | MariaDB (MySQL wire protocol) | via mysql2 |
| ORM | TypeORM | 0.3.x |
| Auth | Passport.js (Google OAuth2, JWT) | 0.7.x |
| JWT | @nestjs/jwt | 11.x |
| Queue | BullMQ | 5.x |
| WebSockets | socket.io via @nestjs/websockets | 11.x |
| Events | @nestjs/event-emitter | 3.x |
| Rate Limiting | @nestjs/throttler | 6.x |
| Validation | class-validator + class-transformer | latest |
| API Docs | @nestjs/swagger (Swagger UI) | 11.x |
| Security | helmet, cookie-parser, csrf-csrf | latest |
| Testing | Jest + Supertest | 30.x / 7.x |
| Linting | ESLint + Prettier + typescript-eslint | 9.x / 3.x / 8.x |

### Frontend (coderank-client)

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Angular (Standalone Components) | 21.x |
| Language | TypeScript | 5.9.x |
| UI Library | PrimeNG (Aura theme) | 21.x |
| Styling | TailwindCSS 4 via PostCSS | 4.x |
| Code Editor | Monaco Editor (ngx-monaco-editor-v2-alternative) | 0.55.x |
| Rich Text | Quill | 2.x |
| Markdown | marked + DOMPurify | 17.x / 3.x |
| State | Angular Signals | built-in |
| HTTP | Angular HttpClient with functional interceptors | built-in |
| Testing | Vitest | 4.x |

---

## 4. Backend — coderank-api

### 4.1 Architecture

The API follows a **layered modular architecture** with five root-level modules imported in `app.module.ts`:

```
AppModule
├── RootConfigModule     (Global) — All configuration services
├── RootProviderModule   (Global) — Infrastructure providers (DB, JWT, BullMQ, etc.)
├── RootIntegrationModule(Global) — External service integrations
├── RootModule           — Feature domain modules
└── AuthModule           (Global) — Authentication & authorization
```

**Global Guards** (applied to ALL routes via `APP_GUARD`):
1. `ThrottlerGuard` — Rate limiting
2. `JwtAuthGuard` — JWT authentication (use `@Public()` decorator to skip)
3. `RolesGuard` — Role-based access control (use `@Roles()` decorator)
4. `OwnerGuard` — Resource ownership checks (use `@Owner()` decorator)

**Global Pipes/Filters/Interceptors** (set in `main.ts`):
- `ValidationPipe` — Auto-validates DTOs with whitelist, transform, and forbidNonWhitelisted
- `GlobalExceptionFilter` — Standardizes all error responses
- `TransformInterceptor` — Wraps all success responses in `{ success, statusCode, message, data, meta, timestamp, path }`

### 4.2 Module Organization

Each feature module follows this structure:
```
module-name/
├── module-name.module.ts          # NestJS module definition
├── module-name.controller.ts      # REST controller
├── services/                      # Business logic services
│   └── *.service.ts
├── entities/                      # TypeORM entity definitions
│   └── *.entity.ts
├── dto/                           # Data Transfer Objects
│   └── *.dto.ts
├── listeners/                     # Event listeners (optional)
├── processor/                     # BullMQ processors (optional)
├── events/                        # Event definitions (optional)
└── decorator/                     # Module-specific decorators (optional)
```

### 4.3 Authentication & Authorization

- **OAuth2 Flow:** Google OAuth2 (+ GitHub strategy available but not yet fully wired)
- **Token Strategy:**
  - Access token: JWT, 15-minute expiry, sent in `Authorization: Bearer` header
  - Refresh token: JWT, 7-day expiry, stored in `httpOnly` cookie named `refreshToken`
- **Session Management:** Sessions tracked in DB with IP address validation; IP mismatch triggers session revocation
- **Token Revocation:** Both access and refresh tokens are tracked and can be individually revoked
- **Login Flow:**
  1. Client redirects to `GET /api/auth/google`
  2. Google redirects back to `GET /api/auth/google/callback`
  3. Server creates/validates user, generates tokens, creates session
  4. Server redirects to `CLIENT_URL/auth/callback?accessToken=...&user=...`
  5. Client stores tokens in localStorage and cookie
- **Refresh Flow:** `POST /api/auth/refresh-tokens` (reads `refreshToken` from cookie)
- **Logout:** `GET /api/auth/logout` (revokes tokens, invalidates session, clears cookie)

**Decorators:**
- `@Public()` — Skip JWT authentication
- `@Roles(RolesEnum.Admin)` — Require specific roles
- `@Owner()` — Require resource ownership
- `@CurrentUser()` — Extract current user from request
- `@ResponseMessage('...')` — Set custom success message
- `@SkipTransform()` — Skip response transformation

### 4.4 Database

- **Engine:** MariaDB (connected via mysql2 driver)
- **ORM:** TypeORM with repository pattern
- **Entities:** All entities extend `BaseEntity` which provides:
  - `id` — UUID (auto-generated)
  - `createdAt` — Timestamp (auto)
  - `updatedAt` — Timestamp (auto)
  - `deletedAt` — Soft delete timestamp (nullable)
  - `authorId` — UUID reference (nullable)
- **Data Source:** Configured in `src/db/data-source.ts` (used for seeding and migrations)
- **Seeding:** `npm run seed` runs `src/db/seeds/seed.ts` with factories for users and problems
- **Config:** Database connection configured via environment variables (`DB_MARIADB_HOST`, `DB_MARIADB_PORT`, etc.)

**Entity Map:**
| Module | Entities |
|--------|----------|
| Users | UsersEntity, TokensEntity, SessionsEntity, AuthProvidersEntity |
| Problems | ProblemsEntity, TestcasesEntity, TagsEntity, HintsEntity, SolutionsEntity, SubmissionsEntity |
| Contests | ContestsEntity, ContestProblemsEntity, ContestParticipantsEntity, ContestSubmissionsEntity |
| Courses | ~13 entities (courses, sections, lessons, quizzes, assignments, enrollments, reviews, etc.) |

### 4.5 Common Layer

Located in `src/common/`:

| Directory | Contents |
|-----------|----------|
| `entities/` | `BaseEntity` — abstract entity with UUID + timestamps |
| `services/` | `BaseService<T>` — generic CRUD service with pagination, soft delete, transactions |
| `dto/` | `PaginationQueryDto`, `ApiResponseDto`, `PaginatedResponseDto`, `ErrorResponseDto` |
| `interfaces/` | `IRepository`, `IPaginationOptions`, `IPaginatedResult`, `IJwtPayload`, `ICheckResult` |
| `enums/` | 15 enums: ProgrammingLanguage, SubmissionStatus, AuthProviders, Roles, Difficulty, ContestStatus, CourseLevel, CourseStatus, LessonType, EnrollmentStatus, QuizQuestionType, etc. |
| `filters/` | `GlobalExceptionFilter` — handles HttpException, TypeORM errors, unknown errors |
| `interceptors/` | `TransformInterceptor` — standardizes all API responses |
| `decorators/` | Swagger decorators, `@ResponseMessage()`, `@SkipTransform()`, API property decorators |
| `exceptions/` | `BusinessException` with error codes (1xxx-9xxx), convenience subclasses |
| `helpers/` | `generateUsernameFromEmail()`, `isValidUsername()`, `generateUniqueUsername()` |
| `constants/` | `DB_TABLES`, `DB_CONSTRAINTS`, `COLORS` (terminal output) |

### 4.6 Feature Modules

**Users Module** (`src/modules/users/`):
- Services: `UserService`, `TokenService`, `SessionService`, `AuthProviderService`
- No controller (accessed via AuthModule and other modules)

**Problems Module** (`src/modules/problems/`):
- Controller: `ProblemsController` — Full CRUD for problems, testcases, tags, hints, solutions, submissions
- Services: `ProblemsService`, `TestcasesService`, `TagsService`, `HintsService`, `SolutionsService`, `SubmissionsService`
- Listeners: `SubmissionCompletedListener` — handles post-submission events

**Contests Module** (`src/modules/contests/`):
- Controller: `ContestsController` — Contest CRUD, participant management, submissions, leaderboard
- Services: `ContestsService`, `ContestProblemsService`, `ContestParticipantsService`, `ContestSubmissionsService`

**Courses Module** (`src/modules/courses/`):
- Controller: `CoursesController` — Full LMS CRUD
- Services: ~12 services covering courses, sections, lessons, quizzes, assignments, enrollments, reviews

**Runner Module** (`src/modules/runner/`):
- Controller: `RunnerController` — Code submission endpoint
- Services: `RunnerService`, `CheckerService`
- Processor: `RunnerProcessor` — BullMQ processor for async code execution
- Events: `SubmissionCompletedEvent` — emitted after code execution

### 4.7 Integrations & Providers

**Providers** (`src/providers/`):
| Provider | Purpose |
|----------|---------|
| `MariadbProviderModule` | TypeORM database connection |
| `JwtProviderModule` | JWT token signing/verification |
| `ThrottlerProviderModule` | Rate limiting configuration |
| `BullmqProviderModule` | BullMQ job queue (Redis-backed) |
| `EventEmitterProviderModule` | In-process event bus |

**Integrations** (`src/integrations/`):
| Integration | Purpose |
|-------------|---------|
| `GoogleOauth2Module` | Google OAuth2 authentication |
| `GoogleDriveModule` | Google Drive file storage |
| `LocalStorageModule` | Local file system storage |

### 4.8 Configuration

All configuration is in `src/config/` with dedicated modules:

| Config Module | Environment Variables |
|---------------|----------------------|
| `AppConfigModule` | `APP_NAME`, `APP_ENV`, `APP_HOST`, `APP_PORT`, `CLIENT_URL` |
| `JwtConfigModule` | `JWT_SECRET`, `JWT_EXPIRATION` |
| `MariadbConfigModule` | `DB_MARIADB_HOST`, `DB_MARIADB_PORT`, `DB_MARIADB_USERNAME`, `DB_MARIADB_PASSWORD`, `DB_MARIADB_NAME` |
| `GoogleConfigModule` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` |
| `GithubConfigModule` | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` |

Swagger config is in `src/config/swagger/` and serves API docs at `/api-docs`.

### 4.9 API Conventions

- **Global prefix:** `/api` (all routes start with `/api/`)
- **Static files:** Uploaded files served at `/api/files/` from `uploads/` directory
- **Swagger UI:** Available at `/api-docs`
- **Response format:** All responses wrapped in `{ success, statusCode, message, data, meta, timestamp, path }`
- **Error format:** `{ success: false, statusCode, message, error, timestamp, path, method, correlationId? }`
- **Pagination:** Query params `page`, `limit`, `sortBy`, `sortOrder`, `search`
- **Soft deletes:** Entities use `deletedAt` column for soft deletion
- **CORS:** Configured for `http://localhost:4200` with credentials

---

## 5. Frontend — coderank-client

### 5.1 Architecture

Angular 21 application using **standalone components** (no NgModules) with **lazy-loaded routes** and **functional guards/interceptors**.

```
app/
├── core/              # Singleton services, guards, interceptors
├── data/              # API layer, DTOs, models, enums, constants
├── features/          # Feature modules (admin, lecturer, student, auth)
├── layouts/           # Shell layouts per user role
└── shared/            # Reusable UI components
```

**App Configuration** (`app.config.ts`):
- Router with lazy-loaded routes
- HttpClient with 3 functional interceptors (auth → loading → error)
- PrimeNG with Aura theme preset
- Monaco Editor with dark theme defaults

### 5.2 Core Layer

Located in `src/app/core/`:

**Services:**
| Service | Purpose |
|---------|---------|
| `ApiService` | HTTP wrapper with GET/POST/PUT/PATCH/DELETE + file upload methods |
| `AuthService` | OAuth login, JWT management, signal-based user state, role checks |
| `LoadingService` | Reference-counted loading state with Angular Signals |

**Guards** (functional `CanActivateFn`):
| Guard | Purpose |
|-------|---------|
| `authGuard` | Requires authentication, redirects to `/login` |
| `guestGuard` | Requires NOT authenticated, redirects to `/` |
| `studentGuard` | Requires `student` role |
| `lecturerGuard` | Requires `instructor` role |
| `adminGuard` | Requires `admin` role |
| `smartRedirectGuard` | Redirects to role-appropriate dashboard |

**Interceptors** (functional `HttpInterceptorFn`):
| Interceptor | Purpose |
|-------------|---------|
| `authInterceptor` | Attaches `Bearer` token + `withCredentials: true` |
| `loadingInterceptor` | Auto show/hide loading spinner (respects `X-Skip-Loading` header) |
| `errorInterceptor` | Handles 401 with automatic token refresh + request queuing, error formatting |

### 5.3 Data Layer

Located in `src/app/data/`:

- **`api/`** — API service classes extending `BaseApi`, one per domain:
  - `AuthApi`, `UsersApi`, `ProblemsApi`, `ContestsApi`, `CoursesApi`, `RunnerApi`
- **`constants/api.constants.ts`** — Centralized `API_ENDPOINTS` object with typed endpoint paths
- **`dto/`** — Request/response DTOs organized by domain (auth, problems, contests, courses)
- **`models/`** — TypeScript interfaces for domain entities (users, problems, contests, courses, submissions, etc.)
- **`enums/enums.ts`** — Client-side enums mirroring backend enums (15+ enums)
- **`interfaces/`** — `IApiResponse<T>`, `IPaginatedResponse<T>`

### 5.4 Feature Modules

Three role-based feature areas, each with lazy-loaded child routes:

**Admin** (`features/admin/`):
- Dashboard, Problems (CRUD), Contests (CRUD), Courses (CRUD with duplication), Users, Reports, Logs, Settings
- Full management capabilities with form dialogs and detail views

**Lecturer** (`features/lecturer/`):
- Dashboard, Analytics, Problems (CRUD + code editor + testcase management), Contests (CRUD), Courses, Students, Grading
- Includes Monaco Editor integration for code editing
- Submission result viewing

**Student** (`features/student/`):
- Problems (list + detail + submissions + solutions), Contests (list + detail + participation), Courses (list + detail + lesson viewing)
- Problem solving with submission tracking

**Auth** (`features/auth/pages/`):
- Login page (Google/GitHub OAuth buttons)
- Callback page (handles OAuth redirect, stores tokens)

### 5.5 Layouts & Shared Components

**Layouts** (`layouts/`):
| Layout | Purpose |
|--------|---------|
| `BaseLayoutComponent` | Base shell layout |
| `AdminLayoutComponent` | Admin dashboard shell |
| `LecturerLayoutComponent` | Lecturer dashboard shell |
| `StudentLayoutComponent` | Student dashboard shell |
| Shared: `HeaderComponent`, `SidebarComponent` | Reusable navigation components |

**Shared Components** (`shared/components/`):
| Component | Purpose |
|-----------|---------|
| `CodeEditorComponent` | Monaco Editor wrapper |
| `TextEditorComponent` | Quill rich text editor wrapper |
| `MarkdownViewComponent` | Markdown rendering with DOMPurify |
| `LoadingComponent` | Loading spinner |
| `SkeletonComponent` / `TableSkeletonComponent` | Loading placeholders |
| `EmptyStateComponent` | Empty state display |
| `ComingSoonPageComponent` | Placeholder for unimplemented features |

### 5.6 Styling & Theming

- **TailwindCSS 4** via PostCSS (`.postcssrc.json`)
- **PrimeNG Aura theme** configured in `app.config.ts`
- **Design philosophy:** Minimalist with slate color palette (slate-50 through slate-900), light font weights
- **Dark mode:** Supported via CSS custom properties in `styles.css`
- **Monaco Editor:** Dark theme (`vs-dark`) by default
- **Global styles** in `src/styles.css` include prose styling, paginator overrides, focus states
- **Editor config:** 2-space indentation, single quotes for TypeScript, UTF-8

---

## 6. Development Workflow

### 6.1 Getting Started

**Prerequisites:**
- Node.js v18+
- npm v11+
- MariaDB/MySQL database
- Redis (for BullMQ job queue)

**Backend Setup:**
```bash
cd coderank-api
npm install
# Create .env file with required environment variables (see Section 8)
npm run start:dev
```

**Frontend Setup:**
```bash
cd coderank-client
npm install
npm start
```

**Default URLs:**
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api-docs`

### 6.2 Available Scripts

**Backend (`coderank-api/`):**
| Script | Command | Purpose |
|--------|---------|---------|
| `npm run start:dev` | `nest start --watch` | Dev server with hot reload |
| `npm run build` | `nest build` | Production build |
| `npm run start:prod` | `node dist/main` | Run production build |
| `npm run lint` | `eslint "{src,apps,libs,test}/**/*.ts" --fix` | Lint & auto-fix |
| `npm run format` | `prettier --write "src/**/*.ts" "test/**/*.ts"` | Format code |
| `npm test` | `jest` | Run unit tests |
| `npm run test:e2e` | `jest --config ./test/jest-e2e.json` | Run E2E tests |
| `npm run test:cov` | `jest --coverage` | Test coverage report |
| `npm run seed` | `ts-node ... src/db/seeds/seed.ts` | Seed database |

**Frontend (`coderank-client/`):**
| Script | Command | Purpose |
|--------|---------|---------|
| `npm start` | `ng serve` | Dev server (default: port 4200) |
| `npm run build` | `ng build` | Production build |
| `npm run watch` | `ng build --watch --configuration development` | Watch mode build |
| `npm test` | `ng test` | Run unit tests (Vitest) |

### 6.3 Testing

**Backend:**
- Unit tests: Jest, files matching `*.spec.ts` in `src/`
- E2E tests: Jest + Supertest, files matching `*.e2e-spec.ts` in `test/`
- Config: Jest config in `package.json`, E2E config in `test/jest-e2e.json`
- Transform: `ts-jest` for TypeScript compilation

**Frontend:**
- Unit tests: Vitest (configured via `@angular/build:unit-test`)
- Test files: `*.spec.ts` alongside source files

### 6.4 Linting & Formatting

**Backend:**
- ESLint with `typescript-eslint` (type-checked) + Prettier integration
- Key rules: `@typescript-eslint/no-explicit-any: off`, `no-floating-promises: warn`, `no-unsafe-argument: warn`
- Prettier: single quotes, trailing commas, auto end-of-line

**Frontend:**
- Prettier configured in `package.json`: `printWidth: 100`, `singleQuote: true`, Angular HTML parser
- EditorConfig: 2-space indent, UTF-8, single quotes for TypeScript

---

## 7. Key Patterns & Conventions

### Backend Patterns

1. **Service Inheritance:** All domain services extend `BaseService<T>` which provides `findById()`, `findAll()`, `create()`, `update()`, `delete()`, `softDelete()`, `paginate()`, `transaction()`
2. **Entity Inheritance:** All entities extend `BaseEntity` (UUID + timestamps + soft delete)
3. **Global Guard Chain:** Every request passes through ThrottlerGuard → JwtAuthGuard → RolesGuard → OwnerGuard
4. **Public Routes:** Use `@Public()` decorator to skip authentication
5. **Response Standardization:** All responses automatically wrapped by `TransformInterceptor`; use `@SkipTransform()` to bypass
6. **Business Exceptions:** Use typed `BusinessException` subclasses (e.g., `ResourceNotFoundException`) with categorized error codes
7. **Event-Driven:** Code execution results emitted as events (`SubmissionCompletedEvent`) and handled by listeners
8. **Configuration Pattern:** Each config area has its own module, config file (Joi validation), and service class

### Frontend Patterns

1. **Standalone Components:** No NgModules; all components are standalone with inline imports
2. **Lazy Loading:** All feature routes use `loadComponent()` / `loadChildren()` for code splitting
3. **Functional Guards/Interceptors:** Angular functional style (not class-based)
4. **Signal-Based State:** User auth state managed via Angular Signals (`signal()`, `computed()`)
5. **BaseApi Pattern:** All API services extend `BaseApi` and define an `endpoint` property
6. **Centralized Endpoints:** All API URLs defined in `API_ENDPOINTS` constant
7. **Auto Token Refresh:** 401 errors trigger automatic token refresh with request queuing in `errorInterceptor`
8. **Loading Management:** Reference-counted loading via `LoadingService`; skip with `X-Skip-Loading` header
9. **Smart Redirect:** Root path `/` redirects to role-appropriate dashboard via `smartRedirectGuard`

### Naming Conventions

- **Backend:** PascalCase for classes/entities, camelCase for methods/properties, SCREAMING_SNAKE for constants
- **Frontend:** kebab-case for file names, PascalCase for components/classes, camelCase for methods/properties
- **Database columns:** snake_case (`created_at`, `updated_at`, `deleted_at`)
- **API endpoints:** kebab-case (`/api/auth/refresh-tokens`)
- **Enums:** PascalCase keys with lowercase string values (`DifficultyEnum.Easy = 'easy'`)

---

## 8. Environment & Configuration

### Backend Environment Variables (.env)

```env
# Application
APP_NAME=coderank-api
APP_ENV=development
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

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Redis (for BullMQ)
# (Check BullMQ provider config for specific env var names)
```

### Frontend Environment

- **Production** (`environments/environment.ts`): `apiUrl: 'http://localhost:3000/api'`, `production: true`
- **Development** (`environments/environment.development.ts`): `apiUrl: 'http://localhost:3000/api'`, `production: false`
- Environment file replacement configured in `angular.json` build configurations

---

## 9. Known Considerations

1. **GitHub OAuth:** Strategy file exists (`github.strategy.ts`) but may not be fully connected in the auth flow yet
2. **CORS:** Currently only allows `http://localhost:4200`; update for production deployment
3. **TypeORM Synchronize:** `synchronize: false` in `data-source.ts` — migrations should be used for schema changes
4. **File Uploads:** Served statically from `uploads/` directory at `/api/files/`; ensure directory exists and has proper permissions
5. **Frontend Comments:** Some interceptor code contains Vietnamese comments (the original developer's language)
6. **Monaco Editor:** Assets are copied from `node_modules/monaco-editor` to `assets/monaco` during build (configured in `angular.json`)
7. **Production Environment:** The production `environment.ts` still points to `localhost:3000` — update for actual deployment
8. **WebSockets:** `@nestjs/websockets` and `@nestjs/platform-socket.io` are dependencies but WebSocket gateway implementation details should be verified

---

## 10. Useful References

- [Root README](./README.md) — Setup instructions and overview
- [Client VISUAL_REFERENCE.md](./coderank-client/VISUAL_REFERENCE.md) — ASCII design guide with exact spacing, colors, and typography
- [NestJS Documentation](https://docs.nestjs.com) — Backend framework docs
- [Angular Documentation](https://angular.dev) — Frontend framework docs
- [PrimeNG Documentation](https://primeng.org) — UI component library
- [TailwindCSS v4 Documentation](https://tailwindcss.com/docs) — Utility-first CSS
- [TypeORM Documentation](https://typeorm.io) — ORM docs
- [BullMQ Documentation](https://docs.bullmq.io) — Job queue docs

