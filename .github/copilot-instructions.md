# CodeRank Copilot Instructions (Monorepo)

This repository contains 3 Node/TypeScript projects:

- `coderank-api`: NestJS 11 + TypeORM + MariaDB
- `coderank-client`: Angular 21 + PrimeNG + Tailwind
- `coderank-agent`: Express + LLM providers

Always identify the target subproject first, then run commands in that subproject directory.

## Working rules

- Keep changes scoped to the requested feature/fix.
- Follow existing naming and structure conventions already used in each subproject.
- Never commit secrets or real values from `.env` files.
- Prefer reusing existing services/helpers over duplicating logic.
- Update docs only when directly related to your change.

## Build/test/lint guidance

- Install dependencies with `npm ci` (not `npm install`) for deterministic results.
- Root-level scripts are for PM2 orchestration only; most coding work is inside subprojects.
- Validate only relevant project(s) after edits:
  - API: `npm run build`, `npm run lint`, `npm test` (from `coderank-api/`)
  - Client: `npm run build`, `npm test` (from `coderank-client/`)
  - Agent: run TypeScript-aware checks you can execute from existing scripts (`npm run dev`/`npm start`) and avoid introducing new tooling.

## Architecture quick map

- API business modules: `coderank-api/src/modules/`
- API auth and shared infra: `coderank-api/src/auth/`, `coderank-api/src/common/`
- Client features by role: `coderank-client/src/app/features/`
- Agent core loop and tools: `coderank-agent/src/core/`

## Key platform conventions

- API route prefix: `/api`
- Swagger UI: `/api-docs`
- Role layouts on client: `/student`, `/lecturer`, `/admin`
- Keep role guard flow intact and preserve smart redirect behavior after login

## Common domain enums

- User roles: `admin` | `student` | `instructor` | `problem_setter`
- Problem difficulty: `easy` | `medium` | `hard`
- Course level: `beginner` | `intermediate` | `advanced`
- Course status: `draft` | `published` | `archived`
- Submission status: `pending` | `running` | `accepted` | `wrong_answer` | `time_limit_exceeded` | `memory_limit_exceeded` | `runtime_error` | `compilation_error` | `system_error`

## Supported languages (judge)

- JavaScript, TypeScript, Python, Java, C++, C, Go, Rust

## Safe defaults for code changes

- Preserve public API contracts unless user asked to change them.
- Add/adjust validation and typing together with behavior changes.
- Do not silently swallow errors; keep explicit error handling consistent with surrounding code.
