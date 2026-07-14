import { configureStore } from '@reduxjs/toolkit';
import todoReducer, { VIEW_ONLY_ACTION_TYPES } from '../features/todo/todoSlice';
import uiReducer from '../features/ui/uiSlice';
import { undoable } from './undoable';

const STORAGE_KEY = 'todo-app/state/v2';

// Wrap the todos reducer with undo/redo history. View-only actions (search,
// sort, filter, tag chips) update `present` but don't push an undo checkpoint,
// so hitting Ctrl+Z always reverts an actual data change, not a filter tweak.
const historyReducer = undoable(todoReducer, {
  limit: 50,
  filter: (action) => !VIEW_ONLY_ACTION_TYPES.has(action.type),
});

// ---------------------------------------------------------------------------
// Persistence helpers — no backend, browser localStorage only.
// We only persist the *present* todos snapshot and the ui slice; undo/redo
// history is intentionally session-only (a fresh page load starts a clean
// history stack rather than resurrecting stale checkpoints).
// ---------------------------------------------------------------------------
function loadState() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    const parsed = JSON.parse(serialized);
    if (!parsed || !parsed.todos || !Array.isArray(parsed.todos.items)) {
      return undefined;
    }
    return {
      todos: { past: [], present: parsed.todos, future: [] },
      ui: parsed.ui,
    };
  } catch (err) {
    console.warn('Failed to load persisted state, starting fresh.', err);
    return undefined;
  }
}

function saveState(state) {
  try {
    const toSave = {
      todos: state.todos.present,
      ui: state.ui,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn('Failed to persist state.', err);
  }
}

// Debounce writes so rapid actions (typing, toggling) don't hammer localStorage.
function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSave = debounce(saveState, 300);

export const store = configureStore({
  reducer: {
    todos: historyReducer,
    ui: uiReducer,
  },
  preloadedState: loadState(),
  devTools: process.env.NODE_ENV !== 'production',
});

store.subscribe(() => {
  debouncedSave(store.getState());
});

// Keep multiple tabs in sync: if another tab writes a newer snapshot, pull it
// in through the normal import path so it still creates a single, undoable
// checkpoint instead of silently diverging.
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY && e.newValue) {
    try {
      const parsed = JSON.parse(e.newValue);
      if (parsed?.todos && Array.isArray(parsed.todos.items)) {
        store.dispatch({ type: 'todos/importTodos', payload: parsed.todos.items });
      }
    } catch {
      // Ignore malformed cross-tab payloads.
    }
  }
});

export default store;
