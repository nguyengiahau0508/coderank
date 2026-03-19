---
name: Express Agent
description: Guidelines for developing the CodeRank Express-based AI agent.
---

# Skill: Express Agent Development

Use this skill for changes in `coderank-agent`.

## Practices

- Keep orchestration in `src/core/agent`.
- Keep model-provider logic in `src/core/llm`.
- Keep tool definitions in `src/core/tools` with Zod schema validation.
- Use existing API client patterns in `src/api`.
- Avoid silent error swallowing; return explicit failures for diagnostics.

## Validation commands

- `cd coderank-agent && npm ci --no-audit --no-fund`
- `cd coderank-agent && npx tsc -p tsconfig.json --noEmit` (typecheck sanity)
