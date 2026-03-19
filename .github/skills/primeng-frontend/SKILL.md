---
name: PrimeNG Frontend
description: PrimeNG architecture, theming, and accessibility guidance for the client.
---

# Skill: PrimeNG Frontend

Use this skill for UI work in `coderank-client` with Angular 21 + PrimeNG 21 + Tailwind CSS.

## Core usage rules

- Prefer PrimeNG components over custom UI when an equivalent exists.
- Follow PrimeNG v21 APIs and patterns; avoid deprecated/legacy examples.
- Keep component selection minimal: choose the simplest component that solves the UX need.
- Keep templates readable and avoid over-nesting PrimeNG containers.

## Theming and styling

- Respect the existing PrimeNG theme setup (Aura/styled mode unless explicitly changed).
- Use Tailwind utilities for layout/spacing and PrimeNG for component behavior.
- Avoid deep CSS overrides; prefer PrimeNG pass-through/theming options first.
- Keep icon usage consistent with PrimeIcons unless project explicitly uses custom icons.

## Accessibility and UX

- Ensure keyboard navigation and focus behavior remain correct for overlays/dialogs/menus.
- Use labels, `aria-*` attributes, and semantic structure where components require it.
- For form components, always provide validation feedback and accessible error messaging.
- Keep behavior WCAG AA-friendly and compatible with AXE checks.

## Data-heavy components

- For large lists/tables, prefer pagination, lazy loading, or virtual scrolling where suitable.
- Keep table state predictable (sorting/filtering/pagination) and avoid expensive template logic.
- Use skeleton/loading states for async data.

## Overlay components

- Standardize behavior for dialogs/popovers/toasts (dismiss behavior, escape key, focus trap).
- Ensure overlay open/close state is explicit and testable.

## Reference docs

- PrimeNG docs: `https://primeng.org`
- Installation: `https://primeng.org/installation`
- Configuration: `https://primeng.org/configuration`
- Tailwind integration: `https://primeng.org/tailwind`
- Accessibility: `https://primeng.org/guides/accessibility`
- Overlay API: `https://primeng.org/overlay`
- LLM docs endpoint: `https://primeng.org/llms`

## Validation commands

- `cd coderank-client && npm run build`
- `cd coderank-client && npm test`
