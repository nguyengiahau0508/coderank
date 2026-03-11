# CLAUDE.md — CodeRank Project Guide

## Project Overview

CodeRank is an algorithm practice and learning platform with 3 subprojects in a monorepo:

| Subproject | Tech | Port | Purpose |
|---|---|---|---|
| `coderank-api` | NestJS 11 + MariaDB + TypeORM | 3000 | REST API backend |
| `coderank-client` | Angular 21 + PrimeNG + Tailwind CSS 4 | 4200 | Web frontend |
| `coderank-agent` | Express + Gemini/Ollama/Groq | 4000 | AI assistant agent |

## Quick Commands

```bash
# API (from coderank-api/)
npm run start:dev          # Development with hot-reload
npm run build              # Build for production
npm run start:prod         # Production
npm run seed               # Seed database
npm test                   # Unit tests (Jest)
npm run test:e2e           # E2E tests

# Client (from coderank-client/)
npm start                  # Dev server at :4200
npm run build              # Production build
npm test                   # Tests (Vitest)

# Agent (from coderank-agent/)
npm run dev                # Dev with nodemon
npm start                  # Production
```

## Architecture

### API Structure (NestJS)
- `src/modules/` — Domain modules: problems, courses, contests, runner, users
- `src/auth/` — JWT + OAuth (Google, GitHub), guards, strategies
- `src/common/` — Shared entities, DTOs, enums, filters, interceptors, helpers
- `src/config/` — Config modules: app, db (MariaDB), auth (JWT), integrations (Google/GitHub)
- `src/providers/` — Provider modules for auth, db, integrations
- `src/integrations/` — Google Drive, local storage
- `src/db/` — TypeORM data source, seeds
- API prefix: `/api`, Swagger: `/api-docs`

### Client Structure (Angular)
- `src/app/features/` — Feature modules (student, lecturer, admin)
- `src/app/core/` — Services, guards, interceptors
- `src/app/data/` — Data models, API services
- `src/app/layouts/` — Layout components per role
- `src/app/shared/` — Shared components, pipes, directives
- Three role-based layouts: student (`/student`), lecturer (`/lecturer`), admin (`/admin`)

### Agent Structure
- `src/core/agent/` — Agentic loop (max 10 iterations)
- `src/core/llm/` — LLM factory + providers (Gemini, Ollama, Groq)
- `src/core/tools/` — Tool registry with Zod-validated schemas
- `src/prompts/` — System prompts per role
- `src/api/` — API client for communicating with coderank-api

## Key Domain Concepts

### User Roles
`admin` | `student` | `instructor` | `problem_setter`

### Problem Difficulty
`easy` | `medium` | `hard`

### Submission Status
`pending` | `running` | `accepted` | `wrong_answer` | `time_limit_exceeded` | `memory_limit_exceeded` | `runtime_error` | `compilation_error` | `system_error`

### Supported Languages
JavaScript, TypeScript, Python, Java, C++, C, Go, Rust

### Course Levels
`beginner` | `intermediate` | `advanced`

### Course Status
`draft` | `published` | `archived`

## Database

- **DBMS**: MariaDB
- **ORM**: TypeORM with entity decorators
- **Entities**: User, Problem, TestCase, Submission, Course, Section, Lesson, Enrollment, Contest
- **Data Source**: `coderank-api/src/db/data-source.ts`
- Large text fields use `select: false` to avoid loading by default

## Environment Variables

### API (.env in coderank-api/)
```
APP_NAME, APP_ENV, APP_HOST, APP_PORT, APP_URL, CLIENT_URL
DB_MARIADB_HOST, DB_MARIADB_PORT, DB_MARIADB_USERNAME, DB_MARIADB_PASSWORD, DB_MARIADB_NAME
AUTH_JWT_ACCESS_TOKEN_SECRET, AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN
AUTH_JWT_REFRESH_TOKEN_SECRET, AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN
AUTH_JWT_EMAIL_VERIFICATION_TOKEN_SECRET, AUTH_JWT_EMAIL_VERIFICATION_TOKEN_EXPIRES_IN
AUTH_JWT_PASSWORD_RESET_TOKEN_SECRET, AUTH_JWT_PASSWORD_RESET_TOKEN_EXPIRES_IN
INTEGRATIONS_GITHUB_CLIENT_ID, INTEGRATIONS_GITHUB_CLIENT_SECRET
INTEGRATIONS_GOOGLE_CLIENT_ID, INTEGRATIONS_GOOGLE_CLIENT_SECRET
INTEGRATIONS_GOOGLE_OAUTH2_CLIENT_EMAIL, INTEGRATIONS_GOOGLE_OAUTH2_PRIVATE_KEY
INTEGRATIONS_GOOGLE_OAUTH2_REDIRECT_URI, INTEGRATIONS_GOOGLE_DRIVE_FOLDER_ID
```

### Agent (.env in coderank-agent/)
```
PORT, GEMINI_API_KEY, OLLAMA_HOST, DEFAULT_MODEL_PROVIDER
DEFAULT_GEMINI_MODEL, DEFAULT_OLLAMA_MODEL
GROQ_API_KEY, DEFAULT_GROQ_MODEL
AGENT_SECRET_TOKEN, NESTJS_API_URL
```

## Code Conventions

- **Language**: TypeScript strict mode across all subprojects
- **Naming**: camelCase (variables/functions), PascalCase (classes/interfaces), UPPER_SNAKE_CASE (enum values)
- **API Validation**: class-validator + class-transformer with whitelist mode
- **Agent Validation**: Zod schemas for tool parameters
- **File Naming**: kebab-case with purpose suffix (e.g., `user.entity.ts`, `auth.guard.ts`, `jwt.strategy.ts`, `login.dto.ts`)
- **Module Pattern**: NestJS module encapsulation with config modules
- **Testing**: Jest for API, Vitest for Client
- **Linting**: ESLint + Prettier
- **Code Execution**: Firejail sandboxing for Python and C++ in `/tmp/coderank`

## Security Notes

- Guards: JWT auth globally applied, role-based, owner verification
- Helmet for HTTP headers, CSRF protection enabled
- Rate limiting on API endpoints
- Firejail isolation for code execution (time + memory limits)
- OAuth tokens stored securely, passwords hashed
- DOMPurify for XSS prevention on client

## Important Patterns

- All API routes prefixed with `/api`
- Global exception filter with custom HTTP exception handling
- Request logging interceptor
- Swagger docs auto-generated with decorators
- Lazy-loaded Angular routes per role
- Auth interceptor adds Bearer token to HTTP requests
- Smart redirect based on user role after login
