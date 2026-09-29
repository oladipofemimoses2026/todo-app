# AGENTS.md

Instructions for AI coding agents (e.g. Claude Code) working in this repository.

## Read first
Before changing any code, read these in order:
1. `PRD.md`: what the app must do and the acceptance criteria.
2. `ARCHITECTURE.md`: files, data model, data flow.
3. `STYLE.md`: code conventions.
4. `TASTE.md`: visual and UX rules.

## Hard rules
- Do not add frameworks, libraries, npm packages or a build step.
- Only `js/storage.js` may access `localStorage`.
- Do not change the data model or storage key without updating `ARCHITECTURE.md` and adding a migration.
- Never insert user text with `innerHTML`.
- Use design tokens from `css/style.css`; do not hard-code new colors.
- Keep all paths relative so GitHub Pages works.
- Do not remove accessibility attributes (labels, `aria-*`, focus styles).

## Workflow
1. State a short plan before editing.
2. Work in small steps. After each step, explain how to test it in the browser.
3. Serve the app over http (`python -m http.server`) to test; ES modules do not load from `file://`.
4. Check the browser console for errors after each change.
5. Commit after each completed step with a clear message, e.g. `feat: add note search`, `fix: keep title when edit is empty`, `docs: update PRD`.
6. If a request conflicts with `PRD.md` or `TASTE.md`, ask before proceeding.

## Build phases (reference)
1. Structure: `index.html` skeleton and base CSS tokens
2. Storage: `loadState`, `saveState`, validation
3. Tasks: add, toggle, edit, delete with undo
4. Filters, counter, clear completed, due dates
5. Notes: add, edit, delete, search
6. Theme toggle and empty states
7. Accessibility and mobile pass
8. README and deployment

## Definition of done
- [ ] Every acceptance criterion in `PRD.md` passes.
- [ ] No console errors.
- [ ] Works at 360px width and on desktop.
- [ ] Fully usable with keyboard only (Tab, Enter, Escape, arrow keys on tabs).
- [ ] Light and dark themes both readable.
- [ ] Data survives a page reload.
- [ ] Docs updated if behavior changed.
