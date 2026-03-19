---
name: Monorepo Task Selection
description: Rules for selecting the smallest correct validation scope in the monorepo.
---

# Skill: Monorepo Task Selection

Use this skill to choose the smallest correct validation scope in CodeRank.

## Scope mapping

- Changed `coderank-api/**` -> validate API commands only.
- Changed `coderank-client/**` -> validate Client commands only.
- Changed `coderank-agent/**` -> validate Agent commands only.
- Changed root config / `.github/workflows/**` -> validate all affected projects.

## Rule

Run focused checks first, then broaden only when needed.

## Baseline command set

- API: `cd coderank-api && npm run build && npm run lint`
- Client: `cd coderank-client && npm run build`
- Agent: `cd coderank-agent && npx tsc -p tsconfig.json --noEmit`
