# Tidy: Tasks and Notes

A simple, fast to-do list and notes app that runs entirely in your browser. No sign-up, no server: everything is saved to `localStorage`.

**Live demo:** https://YOUR-USERNAME.github.io/todo-app/

## Features

**Tasks**
- Add tasks with a priority (Low, Medium, High) and an optional due date
- Check tasks off, edit them inline (double-click), delete with undo
- Filter by All, Active or Completed, with a live "tasks left" counter
- Overdue tasks are highlighted
- Clear all completed tasks in one click

**Notes**
- Save notes with an optional title
- Edit and delete notes (with undo)
- Search notes by title or content

**General**
- Data persists across reloads and syncs between open tabs
- Light and dark mode (follows your system setting by default)
- Responsive, mobile-first layout
- Keyboard and screen-reader friendly

## Tech stack
- HTML5, CSS3, vanilla JavaScript (ES modules)
- Browser `localStorage` for persistence
- No frameworks, no dependencies, no build step
- Hosted on GitHub Pages

## Run locally
ES modules need to be served over http, so opening `index.html` directly may not work.

```bash
git clone https://github.com/YOUR-USERNAME/todo-app.git
cd todo-app
python -m http.server 8000
```
Then open http://localhost:8000. (VS Code's Live Server extension also works.)

## Project structure
```
index.html        App markup
css/style.css     Design tokens, themes, components
js/storage.js     localStorage load/save and validation
js/app.js         State, rendering and events
```

## Project documents
| File | Purpose |
|---|---|
| [PRD.md](PRD.md) | Features, user stories, acceptance criteria |
| [ARCHITECTURE.md](ARCHITECTURE.md) | File structure, data model, data flow |
| [STYLE.md](STYLE.md) | Code conventions |
| [TASTE.md](TASTE.md) | Visual and UX direction |
| [AGENTS.md](AGENTS.md) | Rules for AI coding agents working on the repo |

## Screenshots
_Add screenshots of the task list, notes and dark mode here._

## Limitations
Data lives in one browser on one device. Clearing browser data deletes it.
