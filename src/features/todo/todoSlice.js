import { createSlice, nanoid, createSelector } from '@reduxjs/toolkit';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

export const SORTS = {
  MANUAL: 'manual', // respects stored item order — the only order draggable
  CREATED: 'createdAt',
  PRIORITY: 'priority',
  DUE: 'dueDate',
  ALPHA: 'alpha',
};

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

function parseTags(input) {
  if (Array.isArray(input)) return [...new Set(input.map((t) => t.trim().toLowerCase()).filter(Boolean))];
  if (typeof input !== 'string') return [];
  return [...new Set(input.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
const initialState = {
  items: [],
  filter: FILTERS.ALL,
  search: '',
  sort: SORTS.MANUAL,
  tagFilter: [], // array of active tag chips, OR-matched
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare({ text, priority = PRIORITY.MEDIUM, tags = [], dueDate = null }) {
        const now = new Date().toISOString();
        return {
          payload: {
            id: nanoid(),
            text: text.trim(),
            completed: false,
            priority,
            tags: parseTags(tags),
            dueDate, // ISO string or null
            subtasks: [],
            createdAt: now,
            updatedAt: now,
          },
        };
      },
    },

    toggleTodo(state, action) {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
      }
    },

    deleteTodo(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },

    editTodo(state, action) {
      const { id, changes } = action.payload;
      const todo = state.items.find((t) => t.id === id);
      if (todo) {
        const normalized = { ...changes };
        if ('tags' in normalized) normalized.tags = parseTags(normalized.tags);
        Object.assign(todo, normalized, { updatedAt: new Date().toISOString() });
      }
    },

    toggleAll(state) {
      const allCompleted = state.items.every((t) => t.completed);
      state.items.forEach((t) => {
        t.completed = !allCompleted;
        t.updatedAt = new Date().toISOString();
      });
    },

    clearCompleted(state) {
      state.items = state.items.filter((t) => !t.completed);
    },

    reorderTodos(state, action) {
      // payload: full array of ids in new order
      const order = action.payload;
      state.items.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    },

    // -- Subtasks ------------------------------------------------------
    addSubtask(state, action) {
      const { todoId, text } = action.payload;
      const todo = state.items.find((t) => t.id === todoId);
      if (todo && text.trim()) {
        todo.subtasks.push({ id: nanoid(), text: text.trim(), completed: false });
        todo.updatedAt = new Date().toISOString();
      }
    },

    toggleSubtask(state, action) {
      const { todoId, subtaskId } = action.payload;
      const todo = state.items.find((t) => t.id === todoId);
      const sub = todo?.subtasks.find((s) => s.id === subtaskId);
      if (sub) {
        sub.completed = !sub.completed;
        todo.updatedAt = new Date().toISOString();
      }
    },

    deleteSubtask(state, action) {
      const { todoId, subtaskId } = action.payload;
      const todo = state.items.find((t) => t.id === todoId);
      if (todo) {
        todo.subtasks = todo.subtasks.filter((s) => s.id !== subtaskId);
        todo.updatedAt = new Date().toISOString();
      }
    },

    // -- Bulk operations (multi-select mode) ----------------------------
    bulkComplete(state, action) {
      const ids = new Set(action.payload);
      state.items.forEach((t) => {
        if (ids.has(t.id)) {
          t.completed = true;
          t.updatedAt = new Date().toISOString();
        }
      });
    },

    bulkDelete(state, action) {
      const ids = new Set(action.payload);
      state.items = state.items.filter((t) => !ids.has(t.id));
    },

    bulkAddTag(state, action) {
      const { ids, tag } = action.payload;
      const idSet = new Set(ids);
      const clean = tag.trim().toLowerCase();
      if (!clean) return;
      state.items.forEach((t) => {
        if (idSet.has(t.id) && !t.tags.includes(clean)) {
          t.tags.push(clean);
          t.updatedAt = new Date().toISOString();
        }
      });
    },

    // -- Import / restore ------------------------------------------------
    importTodos(state, action) {
      const incoming = Array.isArray(action.payload) ? action.payload : [];
      state.items = incoming.map((t) => ({
        id: nanoid(),
        text: String(t.text ?? '').trim() || 'Untitled task',
        completed: Boolean(t.completed),
        priority: Object.values(PRIORITY).includes(t.priority) ? t.priority : PRIORITY.MEDIUM,
        tags: parseTags(t.tags ?? []),
        dueDate: t.dueDate ?? null,
        subtasks: Array.isArray(t.subtasks)
          ? t.subtasks.map((s) => ({ id: nanoid(), text: String(s.text ?? ''), completed: Boolean(s.completed) }))
          : [],
        createdAt: t.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    },

    // -- View state (excluded from undo history via filter in store.js) --
    setFilter(state, action) {
      state.filter = action.payload;
    },

    setSearch(state, action) {
      state.search = action.payload;
    },

    setSort(state, action) {
      state.sort = action.payload;
    },

    toggleTagFilter(state, action) {
      const tag = action.payload;
      state.tagFilter = state.tagFilter.includes(tag)
        ? state.tagFilter.filter((t) => t !== tag)
        : [...state.tagFilter, tag];
    },

    clearTagFilter(state) {
      state.tagFilter = [];
    },
  },
});

export const {
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  toggleAll,
  clearCompleted,
  reorderTodos,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  bulkComplete,
  bulkDelete,
  bulkAddTag,
  importTodos,
  setFilter,
  setSearch,
  setSort,
  toggleTagFilter,
  clearTagFilter,
} = todoSlice.actions;

export default todoSlice.reducer;

// Action types that should NOT create an undo checkpoint (view-only state).
export const VIEW_ONLY_ACTION_TYPES = new Set([
  setFilter.type,
  setSearch.type,
  setSort.type,
  toggleTagFilter.type,
  clearTagFilter.type,
]);

// ---------------------------------------------------------------------------
// Selectors
// Note: with the undo/redo wrapper, `state.todos` is `{ past, present, future }`.
// `selectTodosState` below always reads the live/present slice.
// ---------------------------------------------------------------------------
const selectTodosState = (state) => state.todos.present;

export const selectAllTodos = (state) => selectTodosState(state).items;
export const selectFilter = (state) => selectTodosState(state).filter;
export const selectSearch = (state) => selectTodosState(state).search;
export const selectSort = (state) => selectTodosState(state).sort;
export const selectTagFilter = (state) => selectTodosState(state).tagFilter;

export const selectCanUndo = (state) => state.todos.past.length > 0;
export const selectCanRedo = (state) => state.todos.future.length > 0;

export const selectAllTags = createSelector(selectAllTodos, (items) => {
  const set = new Set();
  items.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
  return Array.from(set).sort();
});

export const selectVisibleTodos = createSelector([selectTodosState], (state) => {
  const { items, filter, search, sort, tagFilter } = state;
  let result = items;

  if (filter === FILTERS.ACTIVE) result = result.filter((t) => !t.completed);
  if (filter === FILTERS.COMPLETED) result = result.filter((t) => t.completed);

  if (tagFilter.length > 0) {
    result = result.filter((t) => t.tags.some((tag) => tagFilter.includes(tag)));
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (t) => t.text.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q))
    );
  }

  if (sort === SORTS.MANUAL) return result;

  const sorted = [...result];
  switch (sort) {
    case SORTS.PRIORITY:
      sorted.sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]);
      break;
    case SORTS.DUE:
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      break;
    case SORTS.ALPHA:
      sorted.sort((a, b) => a.text.localeCompare(b.text));
      break;
    default:
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return sorted;
});

export const selectStats = createSelector(selectAllTodos, (items) => {
  const total = items.length;
  const completed = items.filter((t) => t.completed).length;
  const active = total - completed;
  const overdue = items.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, active, overdue, percent };
});
