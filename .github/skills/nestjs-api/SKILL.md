---
name: NestJS API
description: NestJS backend development guidance for the CodeRank API.
---

# Skill: NestJS API Development

Use this skill for backend changes in `coderank-api`.

## Practices

- Follow module structure in `src/modules/<domain>/` (controller, service, dto, entities).
- Use DTO validation with `class-validator` and existing global validation behavior.
- Keep route and response patterns consistent with current API conventions.
- Reuse shared utilities from `src/common` and auth patterns from `src/auth`.

## Validation commands

- `cd coderank-api && npm run build`
- `cd coderank-api && npm run lint`
- `cd coderank-api && npm test`
