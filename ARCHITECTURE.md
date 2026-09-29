# Architecture

## Stack
- HTML5, CSS3, vanilla JavaScript (ES modules)
- Persistence: browser `localStorage`
- No frameworks, no npm packages, no build step
- Hosting: any static host (GitHub Pages)

## File structure
```
todo-app/
├── index.html        Markup for header, tabs, both panels, toast
├── css/
│   └── style.css     Design tokens (:root), themes, all component styles
├── js/
│   ├── storage.js    The only module that touches localStorage
│   └── app.js        State, actions, rendering, event listeners
├── AGENTS.md         Rules for AI coding agents working on this repo
├── CLAUDE.md         Loads AGENTS.md for Claude Code
├── ARCHITECTURE.md   This file
├── PRD.md            Product requirements
├── STYLE.md          Code conventions
├── TASTE.md          Visual and UX direction
└── README.md
```

## Data model
Everything is stored as one JSON object under the key `todo-app:v1`.

```json
{
  "tasks": [
    {
      "id": "lx3k9a2fq7",
      "title": "Submit project",
      "completed": false,
      "priority": "high",
      "dueDate": "2026-09-29",
      "createdAt": 1790717219687
    }
  ],
  "notes": [
    {
      "id": "lx3kb1c9zz",
      "title": "Ideas",
      "body": "Add reminders later",
      "createdAt": 1790717219687,
      "updatedAt": 1790717219687
    }
  ],
  "filter": "all",
  "view": "tasks",
  "theme": null
}
```

| Field | Rules |
|---|---|
| `priority` | `"low"`, `"medium"` or `"high"`. Invalid values become `"medium"`. |
| `dueDate` | `YYYY-MM-DD` string or `null`. |
| `filter` | `"all"`, `"active"` or `"completed"`. |
| `view` | `"tasks"` or `"notes"`. |
| `theme` | `"light"`, `"dark"` or `null` (follow system). |

The `:v1` suffix is the schema version. A breaking change to the model must use a new key and a migration in `storage.js`.

## Modules

### storage.js
- `loadState()`: reads and parses saved data, validates and normalizes every task and note, and returns defaults if data is missing or corrupted (inside `try/catch`).
- `saveState(state)`: writes JSON; returns `false` if the browser refuses (quota full, private mode).
- `createId()`: short unique id from timestamp + random.

### app.js
- **Saved state**: `tasks`, `notes`, `filter`, `view`, `theme`.
- **UI-only state** (never saved): `editingTaskId`, `editingNoteId`, `noteQuery`, `justAddedId`, `lastDeleted`.
- **Actions**: `addTask`, `toggleTask`, `deleteTask`, `saveTaskEdit`, `clearCompleted`, `addNote`, `saveNoteEdit`, `deleteNote`, `undoDelete`.
- **Render functions**: `render()` calls `applyTheme`, `renderView`, `renderTasks`, `renderNotes`.

## Data flow
```
user action -> action function mutates state -> commit() -> saveState() -> render()
```
- `commit()` is the only path that saves. If saving fails, a toast tells the user.
- Rendering rebuilds the lists from state each time (lists are small, so this is fast and simple).
- List events use delegation: one listener on each `<ul>`, reading `data-action` and the item's `data-id`.
- User text is always inserted with `textContent`, never `innerHTML`, to prevent XSS. `innerHTML` is only used for the fixed SVG icon strings.

## Sync across tabs
`app.js` listens for the `storage` event on `todo-app:v1` and reloads state so two open tabs stay consistent.

## Deployment
- All paths are relative (`css/style.css`, `js/app.js`) so the site works from a GitHub Pages sub-path.
- ES modules require the page to be served over http(s). Locally, use VS Code Live Server or `python -m http.server`; opening `index.html` directly from the file system will block the modules in most browsers.
- GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.
