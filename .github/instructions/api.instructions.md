---
applyTo: "coderank-api/**/*.ts"
---

You are editing the CodeRank API (`NestJS 11`).

## Scope and patterns

- Keep domain logic inside `src/modules/<domain>/`.
- Use DTOs with `class-validator` for request validation.
- Keep route prefix conventions (`/api`) and Swagger decorators consistent.
- Prefer existing guards/interceptors/filters patterns in `src/auth` and `src/common`.

## Data and entities

- Use TypeORM entities and relations consistently with current style.
- Avoid loading heavy text columns unnecessarily; follow existing `select: false` patterns where applicable.
- Respect existing enum values and role names.

## Validation before handoff

Run from `coderank-api/`:

1. `npm run build`
2. `npm run lint`
3. `npm test`

If the change touches e2e-sensitive behavior, also run `npm run test:e2e` when feasible.
