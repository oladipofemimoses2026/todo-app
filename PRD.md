# PRD: Tidy (Tasks and Notes)

## 1. Overview
Tidy is a lightweight web app for keeping a to-do list and quick notes in one place. It runs entirely in the browser, needs no account, and saves everything to `localStorage`.

## 2. Target user
Students and early-career professionals who want a fast, distraction-free list on phone or laptop without signing up for anything.

## 3. Goals
- Add a task in under 3 seconds.
- Never lose data on page reload.
- Work well on a 360px-wide phone screen and on desktop.
- Be fully usable with a keyboard and a screen reader.

## 4. User stories
- As a user, I can add a task with a title, priority and optional due date so I can plan my day.
- As a user, I can check a task off so I can see progress.
- As a user, I can fix a typo in a task without deleting it.
- As a user, I can delete a task and undo it if I made a mistake.
- As a user, I can filter tasks by All, Active or Completed.
- As a user, I can save free-form notes and find them again with search.
- As a user, I can switch between light and dark mode.

## 5. Features and acceptance criteria

### F1. Add task
- Title is required, trimmed, max 120 characters.
- Submitting an empty title shows the error "Type a task title first." and does not create a task.
- Priority: Low, Medium (default) or High.
- Due date is optional.
- New tasks appear at the top of the list. The form resets and focus returns to the title field.

### F2. Complete / uncomplete
- Clicking the round checkbox toggles completion.
- Completed tasks show a strike-through title and muted metadata.

### F3. Edit task
- Double-click the title or press the edit button to edit inline.
- Enter or clicking away saves. Escape cancels.
- Saving an empty title keeps the old title.

### F4. Delete task with undo
- Delete button removes the task and shows a toast "Task deleted" with an Undo button for 5 seconds.
- Undo restores the task to its original position.

### F5. Filters and counter
- Filters: All, Active, Completed. The active filter is visually marked and uses `aria-pressed`.
- Counter shows "N tasks left" (singular "task" for 1).
- The chosen filter persists across reloads.

### F6. Clear completed
- "Clear completed" button is only visible when at least one completed task exists.
- Clicking it removes all completed tasks and confirms with a toast.

### F7. Due dates and overdue
- Due dates display as "Due today", "Due tomorrow", "Due Oct 3", or "Overdue, Sep 27".
- Overdue, incomplete tasks show the due label in the danger color.

### F8. Notes
- Notes tab with its own form: optional title (max 80), body (max 2000).
- A note needs a title or body; otherwise show "Write a title or some text before saving."
- Notes show as cards with title, body (line breaks preserved), and "Added" or "Edited" date.
- Edit a note in place (Save / Cancel, Ctrl+Enter saves, Escape cancels).
- Delete a note with the same undo toast as tasks.
- Search filters notes by title and body, case-insensitive. The search box is hidden when there are no notes.

### F9. Persistence
- All tasks, notes, filter, current tab and theme are saved to `localStorage` after every change.
- Missing or corrupted data never crashes the app; it starts with empty lists.
- Changes made in another browser tab sync automatically.

### F10. Theme
- Follows the system light/dark preference by default.
- Toggle button switches theme; the choice is remembered.

### F11. Empty states
- No tasks: "No tasks yet" with a prompt to add one.
- Filter has no results: a message specific to that filter.
- No notes / no search matches: specific messages.

## 6. Out of scope
User accounts, cloud sync, sharing, reminders/notifications, subtasks, tags, drag-to-reorder, rich text in notes.

## 7. Success criteria
- Every acceptance criterion above passes in Chrome (desktop and Android).
- No errors in the browser console during normal use.
- Deployed and reachable on a public URL.
