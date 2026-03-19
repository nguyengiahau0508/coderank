---
applyTo: "coderank-client/**/*.ts,coderank-client/**/*.html,coderank-client/**/*.css"
---

You are editing the CodeRank client (`Angular 21`).

## Scope and patterns

- Follow standalone component patterns already used in the app.
- Keep role-based feature boundaries under `src/app/features/{student,lecturer,admin}`.
- Reuse services in `src/app/core` and `src/app/data` before creating new ones.
- Keep UI consistent with PrimeNG + Tailwind conventions already in the codebase.
- Apply advanced Angular coding conventions from `.github/skills/angular-frontend/SKILL.md`.
- Apply PrimeNG architecture and implementation conventions from:
  - `.github/skills/primeng-frontend/SKILL.md`
  - `.github/skills/primeng-patterns/SKILL.md`

## Routing and auth conventions

- Preserve existing guard flow (`guest`, role guards, smart redirects).
- Avoid breaking route trees under `/student`, `/lecturer`, `/admin`.

## Validation before handoff

Run from `coderank-client/`:

1. `npm run build`
2. `npm test`
