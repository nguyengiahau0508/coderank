---
name: PrimeNG Patterns
description: Reusable PrimeNG implementation patterns and checklists.
---

# Skill: PrimeNG Patterns Cookbook

Use this skill for consistent PrimeNG implementation patterns in `coderank-client`.

## 1) Data Table Pattern (`p-table`)

- Use server-side pagination/filter/sort for large datasets.
- Keep table state in a single view-model signal.
- Show loading state (`[loading]`) during fetch.
- Provide empty state and error state explicitly.
- Keep row actions grouped and predictable.

Checklist:

- Stable row identity (`dataKey`).
- Clear column headers and sort indicators.
- Accessible action buttons with labels/tooltips.

## 2) Dialog Pattern (`p-dialog` / Dynamic Dialog)

- Drive open/close with explicit state (`signal<boolean>`).
- Set focus intentionally on open and restore on close.
- Keep destructive actions in a clear footer area.
- Avoid embedding heavy business logic in dialog templates.

Checklist:

- Keyboard close behavior is intentional.
- Focus trap works correctly.
- Cancel/confirm actions are clearly separated.

## 3) Form Pattern (PrimeNG + Reactive Forms)

- Always use Reactive Forms.
- Map backend validation errors to form controls explicitly.
- Prefer PrimeNG input components with clear labels and hints.
- Display validation messages only when meaningful (`touched`/submit).

Checklist:

- Error messages are accessible and specific.
- Submit button disabled for invalid/pending states.
- Async submit shows progress and prevents duplicate submissions.

## 4) Toast/Message Pattern (`p-toast`, `p-message`)

- Use `p-toast` for global async feedback (success/failure events).
- Use inline `p-message` for field or section-scoped errors.
- Keep message copy short, action-oriented, and user-friendly.
- Do not show duplicate toasts for the same event.

Checklist:

- Success and error severities are consistent.
- Unexpected errors use a generic safe message plus logs for diagnostics.

## 5) File Upload Pattern (`p-fileupload`)

- Use `customUpload` when backend flow requires signed URLs, chunking, or extra metadata.
- Validate file type and size before upload starts.
- Show per-file progress and a clear final status.
- Keep upload queue state explicit (queued, uploading, success, failed).

Checklist:

- Reject invalid files with actionable messages.
- Retry flow is available for failed uploads.
- Prevent duplicate uploads for the same file when possible.

## 6) Confirm Action Pattern (`p-confirmdialog`, `p-confirmpopup`)

- Use confirmation only for destructive, expensive, or irreversible actions.
- Keep confirm text specific: what will happen and what cannot be undone.
- Prefer `ConfirmPopup` for local/inline actions and `ConfirmDialog` for broader impact.
- Ensure keyboard and focus flow is correct after confirm/cancel.

Checklist:

- Confirm action button style indicates risk (e.g., danger).
- Cancel is always visible and non-destructive.
- On success/failure, provide immediate feedback (toast/message) with next step hints.

## 7) AutoComplete Pattern (`p-autocomplete`)

- Use debounced queries for remote suggestions to avoid request storms.
- Cancel or ignore stale requests when newer input arrives.
- Keep selected value and query text states explicit.
- Show meaningful empty/loading states for suggestion panels.

Checklist:

- Minimum query length enforced before hitting API.
- Keyboard navigation works (`up/down/enter/escape`).
- Selected option model is strongly typed (no `any` payloads).

## 8) Date Input Pattern (`p-datepicker`)

- Define and document timezone behavior per use case (date-only vs datetime).
- For date-only fields, normalize to a consistent transport format before API calls.
- Avoid implicit locale/timezone conversions in business logic.
- Keep min/max and disabled date rules explicit and testable.

Checklist:

- Display format is user-friendly and consistent across screens.
- Stored/submitted value format is deterministic.
- Validation messages cover invalid ranges and required constraints.

## Cross-cutting conventions

- Prefer composition of PrimeNG components over custom wrappers unless reused widely.
- Keep Tailwind for layout/spacing and PrimeNG for component interaction.
- Ensure WCAG AA baseline and AXE pass for interactive flows.

## Verify

- `cd coderank-client && npm run build`
- `cd coderank-client && npm test`
