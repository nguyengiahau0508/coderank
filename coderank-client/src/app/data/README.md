# Data Layer Organization

This folder now supports a domain-first entrypoint structure while keeping backward compatibility.

## Recommended import entrypoints

- `data/index.ts`: Public entrypoint for new code.
- `data/shared`: Cross-domain building blocks (base API, interfaces, constants, enums, base model).
- `data/realtime`: Socket and real-time contracts.
- `data/domains/*`: Domain-specific APIs, DTOs, and models.

## Domain entrypoints

- `data/domains/auth`
- `data/domains/users`
- `data/domains/problems`
- `data/domains/contests`
- `data/domains/courses`
- `data/domains/runner`

## Backward compatibility

Existing folders (`api`, `dto`, `models`, `interfaces`, `constants`, `socket`) are preserved so old imports continue to work.

## Migration strategy

For new code:

1. Prefer imports from `src/app/data` or `src/app/data/domains/*`.
2. Use `src/app/data/shared` for shared primitives.
3. Use `src/app/data/realtime` for socket usage.

For existing code:

1. Keep current imports unchanged to avoid risky mass refactors.
2. Gradually migrate touched files to the new entrypoints.
