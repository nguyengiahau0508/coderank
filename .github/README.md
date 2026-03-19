# `.github` Configuration Guide

This directory is organized to keep Copilot behavior predictable, professional, and easy to extend.

## Structure

- `copilot-instructions.md`: Repository-wide base rules.
- `instructions/`: Path-specific instructions (API, Client, Agent).
- `skills/`: Reusable domain skills (Angular, PrimeNG, NestJS, CI, monorepo workflows).
- `agents/`: Subagent role definitions.
- `prompts/`: Reusable prompts.
- `workflows/`: GitHub Actions workflows.

## Extension strategy

When adding new guidance:

1. Put short, routing-level context in `instructions/`.
2. Put deep implementation playbooks in `skills/`.
3. Keep workflow commands aligned with `skills/monorepo-task-selection/SKILL.md`.
4. Prefer updates over new files when scope overlaps significantly.

## Current frontend guidance

- General Angular rules: `skills/angular-frontend/SKILL.md`
- PrimeNG strategy: `skills/primeng-frontend/SKILL.md`
- PrimeNG implementation cookbook: `skills/primeng-patterns/SKILL.md`
