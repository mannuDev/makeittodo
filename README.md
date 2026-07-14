# Today's Ledger — Todo App (Advanced Edition)

A production-grade, backend-free todo list. React + Redux Toolkit, persisted
to `localStorage` — no account, no server, works fully offline after first load.

## Feature set

**Core**
- Add tasks with priority, tags, and due date
- Inline edit (double-click text, or the "edit" action)
- Delete, with an **Undo** toast — nothing is ever silently gone
- Subtask checklists inside any task, with a done/total counter
- Mark-all / clear-completed, both undoable

**Organization**
- Filter: all / active / completed
- Tag chips: click to filter by one or more tags (OR-matched), "clear" to reset
- Search across text and tags
- Sort: newest, priority, due date, alphabetical, or **manual drag order**
- Drag-to-reorder (via `@dnd-kit`, keyboard-accessible) when sort = manual and no other filter is narrowing the list

**Bulk workflows**
- "Select" mode: multi-select tasks, then complete / tag / delete them as a batch — all undoable

**History**
- Full **undo/redo** (`Ctrl+Z` / `Ctrl+Shift+Z`), backed by a dependency-free history-stack reducer
- View-only actions (search, sort, filter) never pollute the undo stack — only real data changes do

**Data portability**
- Export the entire ledger to a JSON file
- Import a JSON file back in, with a confirmation step and its own undo

**Polish**
- Light/dark theme toggle, respecting system preference on first load
- A small animated 3D bar-chart (`react-three-fiber`) visualizing open vs. done counts, lazy-loaded so it doesn't cost anything until it's needed
- Toast notifications for every destructive/bulk action
- `?` opens a keyboard-shortcuts cheat sheet
- Cross-tab sync: editing the list in one tab updates any other open tab
- Debounced, corruption-safe `localStorage` persistence
- Fully responsive, visible focus states, `prefers-reduced-motion` respected

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Keyboard shortcuts

| Key | Action |
|---|---|
| `N` | Focus the new-task field |
| `/` | Focus search |
| `Shift` + `A` | Toggle mark-all complete |
| `Ctrl`/`Cmd` + `Z` | Undo |
| `Ctrl`/`Cmd` + `Shift` + `Z` | Redo |
| `Esc` | Cancel edit / close dialogs |
| `?` | Toggle the shortcuts panel |

## Project structure

```
src/
├── app/
│   ├── store.js          # Redux store, undo/redo wiring, persistence, cross-tab sync
│   ├── undoable.js         # Dependency-free undo/redo reducer wrapper
│   └── ToastContext.jsx   # Toast notification system (context + UI)
├── components/
│   ├── AddForm.jsx         # New-task form (text, priority, tags, due date)
│   ├── Todo.jsx             # List, filters, tags, bulk-select, drag reorder, import/export
│   ├── ConfirmDialog.jsx  # Generic confirm/cancel modal
│   └── ShortcutsHelp.jsx  # Keyboard-shortcuts panel
├── features/
│   ├── todo/
│   │   └── todoSlice.js  # Todo state, reducers, memoized selectors
│   └── ui/
│       └── uiSlice.js     # Theme + shortcuts-panel UI state
├── App.jsx
├── main.jsx
├── App.css
└── index.css
```

## Design notes

**Why undo/redo instead of confirmation dialogs everywhere?** Modern UX
guidance favors *reversible actions with undo* over interrupting confirmation
dialogs for anything that can be cheaply reverted — it keeps the user in flow.
Confirm dialogs are reserved for the two genuinely hard-to-recover cases:
clearing everything completed at once, and replacing the whole ledger on import.

**Why is drag-reorder only available in one sort mode?** Reordering a
*filtered or sorted* view doesn't have an unambiguous meaning — dragging item
#2 above item #1 in a search result doesn't tell you where it should land in
the full list. Manual order is its own explicit sort mode instead, so drag
handles only appear when reordering is unambiguous.
