# GitHub Copilot Instructions for CodeRank Project

## Project Structure

This is a monorepo containing two main applications:

### 1. coderank-api (Backend)
- **Location**: `./coderank-api/`
- **Framework**: NestJS (TypeScript)
- **Database**: MySQL with TypeORM
- **Key Technologies**:
  - Authentication: Passport.js (JWT, Google OAuth)
  - Queue Management: BullMQ
  - API Documentation: Swagger
  - Security: Helmet, CSRF protection, Throttling

### 2. coderank-client (Frontend)
- **Location**: `./coderank-client/`
- **Framework**: Angular 21 (TypeScript)
- **UI Library**: PrimeNG
- **Styling**: TailwindCSS 4

## Coding Guidelines

### General
- Use TypeScript strict mode
- Follow existing code patterns and conventions
- Use descriptive variable and function names
- Add JSDoc comments for public APIs

### Backend (coderank-api)
- Follow NestJS best practices and module structure
- Use DTOs for request/response validation with class-validator
- Implement proper error handling with custom exceptions
- Use dependency injection for services
- Follow RESTful API conventions
- Use TypeORM repositories for database operations
- Implement proper authentication guards where needed
- File structure: `src/modules/{module-name}/{module-name}.{controller|service|module|entity}.ts`

### Frontend (coderank-client)
- Follow Angular style guide
- Use standalone components (DON'T set `standalone: true`, it's default in Angular 21)
- Use `input()` and `output()` functions instead of decorators
- Set `changeDetection: ChangeDetectionStrategy.OnPush` for all components
- Use `inject()` function instead of constructor injection
- Implement reactive forms with proper validation
- Use Angular signals for state management (`signal()`, `computed()`, `effect()`)
- Use `set()` or `update()` on signals, never `mutate()`
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use class/style bindings instead of `ngClass`/`ngStyle`
- Do NOT use `@HostBinding` and `@HostListener`, use `host` object instead
- Use PrimeNG components consistently
- Apply TailwindCSS utility classes for styling
- MUST pass AXE checks and follow WCAG AA minimums
- File structure: `src/app/features/{feature}/{component-name}/{component-name}.component.ts`

## AI Assistant Guidelines

When working in this codebase:

1. **Context Awareness**: Always check which part of the project you're working in (api vs client)
2. **Technology Stack**: Use appropriate libraries and patterns for each project
3. **Code Style**: Match existing code formatting and conventions
4. **Dependencies**: Suggest packages that are already in use when possible
5. **Testing**: Follow existing test patterns (Jest for API, Vitest for Client)
6. **Security**: Always consider security implications, especially in authentication/authorization code
7. **Performance**: Be mindful of database queries and API calls
8. **Type Safety**: Leverage TypeScript's type system fully

## Common Commands

### API (coderank-api)
```bash
cd coderank-api
npm run start:dev    # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter
npm run seed         # Seed database
```

### Client (coderank-client)
```bash
cd coderank-client
npm start            # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

## File Organization

- Keep related code together in modules/features
- Separate business logic from presentation
- Use shared utilities and helpers in dedicated folders
- Keep environment-specific configs separate
