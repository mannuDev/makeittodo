// A small, dependency-free undo/redo wrapper for a single reducer.
// Wraps `reducer` so its state becomes { past: [], present, future: [] }.
// Only actions that pass `filter(action)` are pushed onto the history stack;
// everything else still updates `present` but leaves past/future untouched.
// This lets view-only actions (search, sort, filter) skip the undo stack
// while data mutations (add/edit/delete/etc.) are undoable.

export const UNDO = 'history/undo';
export const REDO = 'history/redo';

export function undo() {
  return { type: UNDO };
}

export function redo() {
  return { type: REDO };
}

export function undoable(reducer, { limit = 30, filter = () => true } = {}) {
  const initialPresent = reducer(undefined, { type: '@@INIT' });
  const initialState = { past: [], present: initialPresent, future: [] };

  return function undoableReducer(state = initialState, action) {
    const { past, present, future } = state;

    if (action.type === UNDO) {
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      return {
        past: past.slice(0, -1),
        present: previous,
        future: [present, ...future],
      };
    }

    if (action.type === REDO) {
      if (future.length === 0) return state;
      const [next, ...rest] = future;
      return {
        past: [...past, present],
        present: next,
        future: rest,
      };
    }

    const newPresent = reducer(present, action);

    if (newPresent === present) {
      return state;
    }

    if (!filter(action)) {
      // View-only change: update present, don't touch history.
      return { past, present: newPresent, future };
    }

    return {
      past: [...past, present].slice(-limit),
      present: newPresent,
      future: [],
    };
  };
}
