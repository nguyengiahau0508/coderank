# CLAUDE.md — CodeRank API

## Overview
NestJS 11 REST API backend for the CodeRank platform. Handles authentication, problem management, course management, contests, code execution, and user management.

## Commands
```bash
npm run start:dev     # Dev server with hot-reload (port 3000)
npm run build         # Compile TypeScript
npm run start:prod    # Run compiled dist/
npm run seed          # Seed database
npm test              # Jest unit tests
npm run test:e2e      # E2E tests
npm run lint          # ESLint
```

## Module Structure
Each domain module in `src/modules/` follows the pattern:
```
module-name/
  module-name.module.ts    # NestJS module definition
  module-name.controller.ts # REST endpoints
  module-name.service.ts    # Business logic
  dto/                      # Request/Response DTOs with class-validator
  entities/                 # TypeORM entity definitions (if not in common/)
```

### Key Modules
- **problems/** — CRUD, testcases, hints, submissions, solutions
- **courses/** — Courses, sections, lessons, enrollments, quizzes
- **runner/** — Code execution sandbox (Firejail), Python/C++ support
- **users/** — User profiles, roles, session management
- **contests/** — Competition lifecycle

## Config Pattern
Each config category is a separate module under `src/config/`:
- Loads environment variables via `registerAs()`
- Validates with Joi schema
- Exposes typed service with getter methods
- Config modules: `AppConfigModule`, `MariadbConfigModule`, `JwtConfigModule`, `GoogleConfigModule`, `GithubConfigModule`

## Entity Conventions
- Entities in `src/common/entities/` or module-specific
- Use TypeORM decorators: `@Entity()`, `@Column()`, `@ManyToOne()`, etc.
- Large text columns: `select: false`
- Slug fields for URL-friendly identifiers
- Soft delete where applicable

## Guard Stack (applied globally)
1. `JwtAuthGuard` — Validates Bearer token
2. `RolesGuard` — Checks user role against `@Roles()` decorator
3. `OwnerGuard` — Verifies resource ownership via `@Owner()` decorator

## API Conventions
- All routes under `/api` prefix
- Swagger at `/api-docs`
- DTOs validated with class-validator (whitelist mode, forbidNonWhitelisted)
- Consistent error responses via global exception filter
- Pagination support on list endpoints
