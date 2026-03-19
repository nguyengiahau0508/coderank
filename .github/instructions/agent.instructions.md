---
applyTo: "coderank-agent/**/*.ts"
---

You are editing the CodeRank AI agent (`Express` + multi-provider LLM tools).

## Scope and patterns

- Keep tool definitions validated with Zod schemas.
- Follow the existing separation:
  - `src/core/agent` for orchestration loop
  - `src/core/llm` for provider abstraction
  - `src/core/tools` for tool registry and implementations
- Reuse API client patterns in `src/api/` for calls to coderank-api.

## Behavior expectations

- Keep deterministic tool input/output shapes.
- Avoid broad error suppression; surface clear failures for debugging.
- Preserve provider fallback/selection behavior unless explicitly requested.

## Validation before handoff

Run from `coderank-agent/`:

1. `npm start` (quick runtime sanity check), or
2. `npm run dev` for iterative verification

Do not add new lint/test frameworks unless requested.
