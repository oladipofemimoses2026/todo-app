# Code Style

## General
- Plain, readable code over clever code. A beginner should be able to follow any function.
- Functions do one thing and stay under ~40 lines.
- No dependencies, frameworks or build tools.

## JavaScript
- ES modules with `import` / `export`. `"use strict"` is implied by modules.
- `const` by default, `let` only when reassigning, never `var`.
- camelCase for variables and functions; UPPER_SNAKE_CASE for constants (`STORAGE_KEY`).
- Action functions start with a verb: `addTask`, `deleteNote`, `startTaskEdit`.
- Only `storage.js` accesses `localStorage`.
- Every state change goes through `commit()`.
- Insert user content with `textContent`. Never put user input into `innerHTML`.
- Use event delegation on list containers; no inline `onclick` attributes.
- Semicolons, single quotes, 2-space indentation, trailing commas in multiline lists.

## HTML
- Semantic elements: `header`, `nav`, `main`, `section`, `form`, `ul/li`, `footer`, `button`.
- Every input has a `<label>` (visible or `.sr-only`).
- Icon-only buttons have an `aria-label` that names the item, e.g. `Delete "Buy data"`.
- Tabs use `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`; panels use `role="tabpanel"`.
- Live regions: counter and toast use `aria-live="polite"`; form errors use `role="alert"`.

## CSS
- All colors, radii, spacing and shadows come from custom properties on `:root`.
- Class names are kebab-case and describe the component: `.task`, `.task-title`, `.note-footer`.
- State classes start with `is-`: `.is-done`, `.is-new`, `.is-overdue`, `.is-visible`.
- Modifiers use `--`: `.btn-primary`, `.icon-btn--sm`, `.pill--high`.
- No inline styles. No `!important` except for `[hidden]` and reduced motion.
- Mobile-first; one breakpoint at 480px.
- Always keep a visible `:focus-visible` outline.

## Comments
- A short header comment at the top of each file explaining its job.
- Comment the *why*, not the *what*.

## Do / Don't
| Do | Don't |
|---|---|
| Validate and normalize data loaded from storage | Trust `localStorage` contents blindly |
| Keep UI-only state out of storage | Save `editingTaskId` or search text |
| Use tokens like `var(--accent)` | Hard-code hex colors in components |
| Name buttons by what they do ("Save note") | Use vague labels ("Submit", "OK") |
