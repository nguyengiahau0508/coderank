# CLAUDE.md — CodeRank Client

## Overview
Angular 21 frontend for the CodeRank platform. Uses PrimeNG 21 component library, Tailwind CSS 4, and Monaco Editor for code editing.

## Commands
```bash
npm start             # Dev server at :4200
npm run build         # Production build
npm test              # Vitest tests
npm run watch         # Build in watch mode
```

## Architecture
```
src/app/
  features/           # Feature modules per role
    student/          # Problem solving, submissions, courses, ranking
    lecturer/         # Problem/course management, analytics
    admin/            # User management, system stats
  core/               # Singleton services, guards, interceptors
  data/               # Data models, API services, DTOs
  layouts/            # Role-specific layout components
  shared/             # Reusable components, pipes, directives
```

## Routing Pattern
- Three role-based route trees: `/student`, `/lecturer`, `/admin`
- Route guards: `guestGuard`, `studentGuard`, `lecturerGuard`, `adminGuard`
- `smartRedirectGuard` — Redirects to role-appropriate dashboard after login
- All feature routes are lazy-loaded

## Key Libraries
- **PrimeNG 21** — UI components with Aura theme preset
- **Monaco Editor** — Code editor (loaded from `public/monaco-editor/`)
- **Quill** — Rich text editor for content management
- **Marked** — Markdown rendering
- **DOMPurify** — XSS sanitization
- **Tailwind CSS 4** — Utility-first styling

## HTTP Layer
- Auth interceptor attaches Bearer token from stored credentials
- Error interceptor handles 401 (redirect to login), 403, 500 responses
- Loading interceptor manages global loading state
- Base API URL configured in `src/environments/`

## Component Conventions
- Standalone components (no NgModules for feature components)
- File naming: `component-name.ts`, `component-name.html`, `component-name.css`
- Services in `core/` are singleton, feature services co-located with features
- PrimeFlex + Tailwind for responsive layouts
