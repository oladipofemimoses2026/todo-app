// storage.js
// All localStorage access lives here. No other file touches localStorage.

export const STORAGE_KEY = 'todo-app:v1';

const PRIORITIES = ['low', 'medium', 'high'];

function defaultState() {
  return {
    tasks: [],
    notes: [],
    filter: 'all',
    view: 'tasks',
    theme: null, // null = follow system preference
  };
}

function isValidTask(task) {
  return Boolean(task) && typeof task.id === 'string' && typeof task.title === 'string';
}

function isValidNote(note) {
  return Boolean(note) && typeof note.id === 'string' && typeof note.body === 'string';
}

function normalizeTask(task) {
  return {
    id: task.id,
    title: task.title,
    completed: Boolean(task.completed),
    priority: PRIORITIES.includes(task.priority) ? task.priority : 'medium',
    dueDate: typeof task.dueDate === 'string' && task.dueDate ? task.dueDate : null,
    createdAt: Number(task.createdAt) || Date.now(),
  };
}

function normalizeNote(note) {
  return {
    id: note.id,
    title: typeof note.title === 'string' ? note.title : '',
    body: note.body,
    createdAt: Number(note.createdAt) || Date.now(),
    updatedAt: Number(note.updatedAt) || Number(note.createdAt) || Date.now(),
  };
}

/** Reads saved data. Returns a safe default if data is missing or corrupted. */
export function loadState() {
  const fallback = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return {
      tasks: Array.isArray(data.tasks) ? data.tasks.filter(isValidTask).map(normalizeTask) : [],
      notes: Array.isArray(data.notes) ? data.notes.filter(isValidNote).map(normalizeNote) : [],
      filter: ['all', 'active', 'completed'].includes(data.filter) ? data.filter : fallback.filter,
      view: ['tasks', 'notes'].includes(data.view) ? data.view : fallback.view,
      theme: ['light', 'dark'].includes(data.theme) ? data.theme : null,
    };
  } catch (error) {
    console.warn('Saved data could not be read. Starting with an empty list.', error);
    return fallback;
  }
}

/** Saves the full state. Returns false if the browser refused (e.g. storage full or blocked). */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn('Could not save data.', error);
    return false;
  }
}

/** Short unique id, e.g. "lx3k9a2fq7". */
export function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
