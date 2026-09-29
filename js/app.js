// app.js
// State, event handling and rendering for Tidy.
// Flow: user action -> update state -> save -> render.

import { loadState, saveState, createId, STORAGE_KEY } from './storage.js';

const state = loadState();

// UI-only state (not saved)
let editingTaskId = null;
let editingNoteId = null;
let noteQuery = '';
let justAddedId = null;
let lastDeleted = null; // { kind: 'task' | 'note', item, index }
let toastTimer = null;

const $ = (selector) => document.querySelector(selector);

const els = {
  themeToggle: $('#theme-toggle'),
  tabs: document.querySelectorAll('.tab'),
  panelTasks: $('#panel-tasks'),
  panelNotes: $('#panel-notes'),
  tasksBadge: $('#tasks-badge'),
  notesBadge: $('#notes-badge'),

  taskForm: $('#task-form'),
  taskTitle: $('#task-title'),
  taskPriority: $('#task-priority'),
  taskDue: $('#task-due'),
  taskError: $('#task-error'),
  filterBtns: document.querySelectorAll('[data-filter]'),
  taskCounter: $('#task-counter'),
  taskList: $('#task-list'),
  taskEmpty: $('#task-empty'),
  clearCompleted: $('#clear-completed'),

  noteForm: $('#note-form'),
  noteTitle: $('#note-title'),
  noteBody: $('#note-body'),
  noteError: $('#note-error'),
  noteSearch: $('#note-search'),
  noteList: $('#note-list'),
  noteEmpty: $('#note-empty'),

  toast: $('#toast'),
};

const ICONS = {
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
};

/* ---------- helpers ---------- */

function commit() {
  const saved = saveState(state);
  if (!saved) showToast('Could not save. Your browser storage may be full or blocked.');
  render();
}

function todayString() {
  // YYYY-MM-DD in the user's local time zone
  return new Date().toLocaleDateString('en-CA');
}

function isOverdue(task) {
  return Boolean(task.dueDate) && !task.completed && task.dueDate < todayString();
}

function formatDue(dateString) {
  const today = todayString();
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA');
  if (dateString === today) return 'Due today';
  if (dateString === tomorrow) return 'Due tomorrow';
  const label = new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return dateString < today ? `Overdue, ${label}` : `Due ${label}`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function iconButton(action, label, icon, extraClass = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `icon-btn icon-btn--sm ${extraClass}`.trim();
  button.dataset.action = action;
  button.setAttribute('aria-label', label);
  button.innerHTML = ICONS[icon];
  return button;
}

function setEmpty(el, title, sub) {
  el.replaceChildren();
  const heading = document.createElement('p');
  heading.className = 'empty-title';
  heading.textContent = title;
  const text = document.createElement('p');
  text.className = 'empty-sub';
  text.textContent = sub;
  el.append(heading, text);
}

function showError(el, message) {
  el.textContent = message;
  el.hidden = false;
}

function hideError(el) {
  el.hidden = true;
  el.textContent = '';
}

/* ---------- theme ---------- */

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  return state.theme || (systemDark.matches ? 'dark' : 'light');
}

function applyTheme() {
  const theme = currentTheme();
  document.documentElement.dataset.theme = theme;
  els.themeToggle.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
  els.themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

/* ---------- task actions ---------- */

function findTask(id) {
  return state.tasks.find((task) => task.id === id);
}

function addTask(title, priority, dueDate) {
  const task = {
    id: createId(),
    title,
    completed: false,
    priority,
    dueDate: dueDate || null,
    createdAt: Date.now(),
  };
  state.tasks.unshift(task);
  justAddedId = task.id;
  if (state.filter === 'completed') state.filter = 'all'; // so the new task is visible
  commit();
}

function toggleTask(id) {
  const task = findTask(id);
  if (!task) return;
  task.completed = !task.completed;
  commit();
}

function deleteTask(id) {
  const index = state.tasks.findIndex((task) => task.id === id);
  if (index < 0) return;
  const [item] = state.tasks.splice(index, 1);
  lastDeleted = { kind: 'task', item, index };
  commit();
  showToast('Task deleted', true);
}

function startTaskEdit(id) {
  editingTaskId = id;
  renderTasks();
  const input = els.taskList.querySelector('.task-edit');
  if (input) {
    input.focus();
    input.select();
  }
}

function saveTaskEdit(id, value) {
  if (editingTaskId !== id) return;
  editingTaskId = null;
  const task = findTask(id);
  const title = value.trim();
  if (task && title) task.title = title;
  commit();
}

function cancelTaskEdit() {
  editingTaskId = null;
  renderTasks();
}

function clearCompleted() {
  const count = state.tasks.filter((task) => task.completed).length;
  if (!count) return;
  state.tasks = state.tasks.filter((task) => !task.completed);
  commit();
  showToast(`Cleared ${count} completed ${count === 1 ? 'task' : 'tasks'}`);
}

/* ---------- note actions ---------- */

function findNote(id) {
  return state.notes.find((note) => note.id === id);
}

function addNote(title, body) {
  const now = Date.now();
  const note = { id: createId(), title, body, createdAt: now, updatedAt: now };
  state.notes.unshift(note);
  justAddedId = note.id;
  commit();
}

function deleteNote(id) {
  const index = state.notes.findIndex((note) => note.id === id);
  if (index < 0) return;
  const [item] = state.notes.splice(index, 1);
  lastDeleted = { kind: 'note', item, index };
  if (editingNoteId === id) editingNoteId = null;
  commit();
  showToast('Note deleted', true);
}

function startNoteEdit(id) {
  editingNoteId = id;
  renderNotes();
  const input = els.noteList.querySelector('.note-edit textarea');
  if (input) input.focus();
}

function saveNoteEdit(id, card) {
  const note = findNote(id);
  if (!note) return;
  const title = card.querySelector('.note-edit input').value.trim();
  const body = card.querySelector('.note-edit textarea').value.trim();
  if (!body && !title) {
    showToast('A note needs a title or some text');
    return;
  }
  note.title = title;
  note.body = body;
  note.updatedAt = Date.now();
  editingNoteId = null;
  commit();
}

function cancelNoteEdit() {
  editingNoteId = null;
  renderNotes();
}

/* ---------- undo + toast ---------- */

function undoDelete() {
  if (!lastDeleted) return;
  const { kind, item, index } = lastDeleted;
  const list = kind === 'task' ? state.tasks : state.notes;
  list.splice(Math.min(index, list.length), 0, item);
  lastDeleted = null;
  commit();
  hideToast();
}

function showToast(message, withUndo = false) {
  clearTimeout(toastTimer);
  els.toast.replaceChildren();
  const text = document.createElement('span');
  text.textContent = message;
  els.toast.append(text);
  if (withUndo) {
    const undo = document.createElement('button');
    undo.type = 'button';
    undo.className = 'toast-undo';
    undo.textContent = 'Undo';
    undo.addEventListener('click', undoDelete);
    els.toast.append(undo);
  }
  els.toast.hidden = false;
  requestAnimationFrame(() => els.toast.classList.add('is-visible'));
  toastTimer = setTimeout(hideToast, 5000);
}

function hideToast() {
  clearTimeout(toastTimer);
  lastDeleted = null;
  els.toast.classList.remove('is-visible');
  setTimeout(() => {
    if (!els.toast.classList.contains('is-visible')) els.toast.hidden = true;
  }, 200);
}

/* ---------- rendering ---------- */

function visibleTasks() {
  if (state.filter === 'active') return state.tasks.filter((task) => !task.completed);
  if (state.filter === 'completed') return state.tasks.filter((task) => task.completed);
  return state.tasks;
}

function taskItem(task) {
  const li = document.createElement('li');
  li.className = 'task';
  if (task.completed) li.classList.add('is-done');
  if (task.id === justAddedId) li.classList.add('is-new');
  li.dataset.id = task.id;

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'task-check';
  check.checked = task.completed;
  check.dataset.action = 'toggle';
  check.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'not done' : 'done'}`);

  const body = document.createElement('div');
  body.className = 'task-body';

  if (editingTaskId === task.id) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit';
    input.value = task.title;
    input.maxLength = 120;
    input.setAttribute('aria-label', 'Edit task title. Press Enter to save or Escape to cancel.');
    body.append(input);
  } else {
    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;
    title.title = 'Double-click to edit';
    body.append(title);
  }

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  const pill = document.createElement('span');
  pill.className = `pill pill--${task.priority}`;
  pill.textContent = `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`;
  meta.append(pill);
  if (task.dueDate) {
    const due = document.createElement('span');
    due.className = 'due';
    if (isOverdue(task)) due.classList.add('is-overdue');
    due.textContent = formatDue(task.dueDate);
    meta.append(due);
  }
  body.append(meta);

  const actions = document.createElement('div');
  actions.className = 'item-actions';
  actions.append(
    iconButton('edit', `Edit "${task.title}"`, 'edit'),
    iconButton('delete', `Delete "${task.title}"`, 'delete', 'icon-btn--danger'),
  );

  li.append(check, body, actions);
  return li;
}

function renderTasks() {
  const tasks = visibleTasks();
  els.taskList.replaceChildren(...tasks.map(taskItem));
  els.taskList.hidden = tasks.length === 0;

  const left = state.tasks.filter((task) => !task.completed).length;
  els.taskCounter.textContent = state.tasks.length
    ? `${left} ${left === 1 ? 'task' : 'tasks'} left`
    : '';
  els.tasksBadge.textContent = left || '';
  els.clearCompleted.hidden = !state.tasks.some((task) => task.completed);

  els.filterBtns.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === state.filter));
  });

  els.taskEmpty.hidden = tasks.length > 0;
  if (tasks.length === 0) {
    if (state.tasks.length === 0) {
      setEmpty(els.taskEmpty, 'No tasks yet', 'Add your first task above to get started.');
    } else if (state.filter === 'completed') {
      setEmpty(els.taskEmpty, 'Nothing completed yet', 'Check off a task and it will show up here.');
    } else {
      setEmpty(els.taskEmpty, 'All done', 'Every task is complete. Add another or enjoy the break.');
    }
  }
}

function noteCard(note) {
  const li = document.createElement('li');
  li.className = 'note';
  if (note.id === justAddedId) li.classList.add('is-new');
  li.dataset.id = note.id;

  if (editingNoteId === note.id) {
    const wrap = document.createElement('div');
    wrap.className = 'note-edit';
    const title = document.createElement('input');
    title.type = 'text';
    title.value = note.title;
    title.maxLength = 80;
    title.placeholder = 'Title';
    title.setAttribute('aria-label', 'Edit note title');
    const body = document.createElement('textarea');
    body.value = note.body;
    body.rows = 4;
    body.maxLength = 2000;
    body.setAttribute('aria-label', 'Edit note text. Press Ctrl and Enter to save or Escape to cancel.');
    const buttons = document.createElement('div');
    buttons.className = 'note-edit-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn-ghost btn-sm';
    cancel.dataset.action = 'cancel-note';
    cancel.textContent = 'Cancel';
    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'btn btn-primary btn-sm';
    save.dataset.action = 'save-note';
    save.textContent = 'Save note';
    buttons.append(cancel, save);
    wrap.append(title, body, buttons);
    li.append(wrap);
    return li;
  }

  if (note.title) {
    const title = document.createElement('h3');
    title.className = 'note-title';
    title.textContent = note.title;
    li.append(title);
  }
  if (note.body) {
    const body = document.createElement('p');
    body.className = 'note-body';
    body.textContent = note.body;
    li.append(body);
  }

  const footer = document.createElement('div');
  footer.className = 'note-footer';
  const date = document.createElement('span');
  date.className = 'note-date';
  const edited = note.updatedAt - note.createdAt > 1000;
  date.textContent = `${edited ? 'Edited' : 'Added'} ${formatDate(note.updatedAt)}`;
  const actions = document.createElement('div');
  actions.className = 'item-actions';
  const label = note.title || 'note';
  actions.append(
    iconButton('edit-note', `Edit ${label}`, 'edit'),
    iconButton('delete-note', `Delete ${label}`, 'delete', 'icon-btn--danger'),
  );
  footer.append(date, actions);
  li.append(footer);
  return li;
}

function renderNotes() {
  const query = noteQuery.trim().toLowerCase();
  const notes = query
    ? state.notes.filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(query))
    : state.notes;

  els.noteList.replaceChildren(...notes.map(noteCard));
  els.noteList.hidden = notes.length === 0;
  els.notesBadge.textContent = state.notes.length || '';
  els.noteSearch.hidden = state.notes.length === 0;

  els.noteEmpty.hidden = notes.length > 0;
  if (notes.length === 0) {
    if (state.notes.length === 0) {
      setEmpty(els.noteEmpty, 'No notes yet', 'Ideas, links, reminders. Save them above.');
    } else {
      setEmpty(els.noteEmpty, 'No matching notes', `Nothing contains "${noteQuery.trim()}". Try another word.`);
    }
  }
}

function renderView() {
  const isTasks = state.view === 'tasks';
  els.panelTasks.hidden = !isTasks;
  els.panelNotes.hidden = isTasks;
  els.tabs.forEach((tab) => {
    const selected = tab.dataset.view === state.view;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
}

function render() {
  applyTheme();
  renderView();
  renderTasks();
  renderNotes();
  justAddedId = null;
}

/* ---------- events ---------- */

els.themeToggle.addEventListener('click', () => {
  state.theme = currentTheme() === 'dark' ? 'light' : 'dark';
  commit();
});

systemDark.addEventListener('change', () => {
  if (!state.theme) applyTheme();
});

els.tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    state.view = tab.dataset.view;
    commit();
  });
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    state.view = state.view === 'tasks' ? 'notes' : 'tasks';
    commit();
    document.querySelector(`.tab[data-view="${state.view}"]`).focus();
  });
});

// Tasks
els.taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = els.taskTitle.value.trim();
  if (!title) {
    showError(els.taskError, 'Type a task title first.');
    els.taskTitle.focus();
    return;
  }
  hideError(els.taskError);
  addTask(title, els.taskPriority.value, els.taskDue.value);
  els.taskTitle.value = '';
  els.taskDue.value = '';
  els.taskPriority.value = 'medium';
  els.taskTitle.focus();
});

els.taskTitle.addEventListener('input', () => hideError(els.taskError));

els.filterBtns.forEach((button) => {
  button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    commit();
  });
});

els.clearCompleted.addEventListener('click', clearCompleted);

els.taskList.addEventListener('change', (event) => {
  if (event.target.dataset.action !== 'toggle') return;
  toggleTask(event.target.closest('.task').dataset.id);
});

els.taskList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.closest('.task').dataset.id;
  if (button.dataset.action === 'edit') startTaskEdit(id);
  if (button.dataset.action === 'delete') deleteTask(id);
});

els.taskList.addEventListener('dblclick', (event) => {
  const title = event.target.closest('.task-title');
  if (title) startTaskEdit(title.closest('.task').dataset.id);
});

els.taskList.addEventListener('keydown', (event) => {
  if (!event.target.classList.contains('task-edit')) return;
  const id = event.target.closest('.task').dataset.id;
  if (event.key === 'Enter') saveTaskEdit(id, event.target.value);
  if (event.key === 'Escape') cancelTaskEdit();
});

els.taskList.addEventListener('focusout', (event) => {
  if (!event.target.classList.contains('task-edit')) return;
  saveTaskEdit(event.target.closest('.task').dataset.id, event.target.value);
});

// Notes
els.noteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = els.noteTitle.value.trim();
  const body = els.noteBody.value.trim();
  if (!title && !body) {
    showError(els.noteError, 'Write a title or some text before saving.');
    els.noteBody.focus();
    return;
  }
  hideError(els.noteError);
  noteQuery = '';
  els.noteSearch.value = '';
  addNote(title, body);
  els.noteTitle.value = '';
  els.noteBody.value = '';
  els.noteTitle.focus();
});

[els.noteTitle, els.noteBody].forEach((field) => {
  field.addEventListener('input', () => hideError(els.noteError));
});

els.noteBody.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) els.noteForm.requestSubmit();
});

els.noteSearch.addEventListener('input', () => {
  noteQuery = els.noteSearch.value;
  renderNotes();
});

els.noteList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const card = button.closest('.note');
  const id = card.dataset.id;
  const action = button.dataset.action;
  if (action === 'edit-note') startNoteEdit(id);
  if (action === 'delete-note') deleteNote(id);
  if (action === 'save-note') saveNoteEdit(id, card);
  if (action === 'cancel-note') cancelNoteEdit();
});

els.noteList.addEventListener('keydown', (event) => {
  const card = event.target.closest('.note');
  if (!card || !event.target.closest('.note-edit')) return;
  if (event.key === 'Escape') cancelNoteEdit();
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) saveNoteEdit(card.dataset.id, card);
});

// Keep multiple open tabs in sync
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return;
  Object.assign(state, loadState());
  render();
});

render();
