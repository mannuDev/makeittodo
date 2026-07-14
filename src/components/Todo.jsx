import { useState, useMemo, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
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
  selectVisibleTodos,
  selectAllTodos,
  selectStats,
  selectFilter,
  selectSearch,
  selectSort,
  selectTagFilter,
  selectAllTags,
  FILTERS,
  SORTS,
} from '../features/todo/todoSlice';
import { undo } from '../app/undoable';
import { useToast } from '../app/ToastContext';
import ConfirmDialog from './ConfirmDialog';

// ---------------------------------------------------------------------------
// Ink-stroke checkbox — the signature interaction element.
// A hand-drawn-feeling checkmark that "draws" itself via stroke-dashoffset.
// ---------------------------------------------------------------------------
function InkCheckbox({ checked, onChange, label, small }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`ink-checkbox ${checked ? 'is-checked' : ''} ${small ? 'ink-checkbox--small' : ''}`}
      onClick={onChange}
    >
      <svg viewBox="0 0 24 24" className="ink-checkbox__box">
        <rect x="2" y="2" width="20" height="20" rx="4" className="ink-checkbox__rect" />
        <path d="M6 12.5 L10.5 17 L18 7.5" className="ink-checkbox__check" />
      </svg>
    </button>
  );
}

function SelectCheckbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`select-checkbox ${checked ? 'is-checked' : ''}`}
      onClick={onChange}
    />
  );
}

function PriorityDot({ priority }) {
  return <span className={`priority-dot priority-dot--${priority}`} aria-label={`${priority} priority`} />;
}

function formatDue(dueDate) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  const now = new Date();
  const overdue = d < now && d.toDateString() !== now.toDateString();
  return {
    label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    overdue,
  };
}

// ---------------------------------------------------------------------------
// Subtasks — inline checklist within a task
// ---------------------------------------------------------------------------
function Subtasks({ todo }) {
  const dispatch = useDispatch();
  const [draft, setDraft] = useState('');
  const done = todo.subtasks.filter((s) => s.completed).length;

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    dispatch(addSubtask({ todoId: todo.id, text: draft }));
    setDraft('');
  };

  return (
    <div className="subtasks">
      {todo.subtasks.length > 0 && (
        <ul className="subtasks__list">
          {todo.subtasks.map((s) => (
            <li key={s.id} className={`subtasks__row ${s.completed ? 'is-completed' : ''}`}>
              <InkCheckbox
                small
                checked={s.completed}
                onChange={() => dispatch(toggleSubtask({ todoId: todo.id, subtaskId: s.id }))}
                label={`Mark subtask "${s.text}" as ${s.completed ? 'active' : 'complete'}`}
              />
              <span className="subtasks__text">{s.text}</span>
              <button
                type="button"
                className="subtasks__delete"
                aria-label="Delete subtask"
                onClick={() => dispatch(deleteSubtask({ todoId: todo.id, subtaskId: s.id }))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="subtasks__form" onSubmit={submit}>
        <span className="subtasks__mark" aria-hidden="true">↳</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a step…"
          aria-label={`Add subtask to "${todo.text}"`}
        />
      </form>
      {todo.subtasks.length > 0 && (
        <span className="subtasks__count">
          {done}/{todo.subtasks.length} done
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single row
// ---------------------------------------------------------------------------
function TodoRowContent({ todo, index, dragHandleProps, onDelete, selectMode, selected, onToggleSelect }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.text) {
      dispatch(editTodo({ id: todo.id, changes: { text: trimmed } }));
    } else {
      setDraft(todo.text);
    }
    setIsEditing(false);
  };

  const due = formatDue(todo.dueDate);

  return (
    <>
      {selectMode ? (
        <SelectCheckbox
          checked={selected}
          onChange={() => onToggleSelect(todo.id)}
          label={`Select "${todo.text}"`}
        />
      ) : dragHandleProps ? (
        <button type="button" className="todo-row__handle" aria-label="Drag to reorder" {...dragHandleProps}>
          ⠿
        </button>
      ) : (
        <span className="todo-row__line" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}

      <InkCheckbox
        checked={todo.completed}
        onChange={() => dispatch(toggleTodo(todo.id))}
        label={`Mark "${todo.text}" as ${todo.completed ? 'active' : 'complete'}`}
      />

      <div className="todo-row__body">
        {isEditing ? (
          <input
            ref={inputRef}
            className="todo-row__edit-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') {
                setDraft(todo.text);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <span className="todo-row__text" onDoubleClick={() => setIsEditing(true)}>
            {todo.text}
          </span>
        )}

        <div className="todo-row__meta">
          <PriorityDot priority={todo.priority} />
          {todo.tags.map((tag) => (
            <span key={tag} className="todo-row__tag">
              #{tag}
            </span>
          ))}
          {due && (
            <span className={`todo-row__due ${due.overdue ? 'is-overdue' : ''}`}>
              {due.overdue ? 'overdue · ' : 'due '}
              {due.label}
            </span>
          )}
          <button type="button" className="todo-row__subtask-toggle" onClick={() => setShowSubtasks((v) => !v)}>
            {todo.subtasks.length > 0
              ? `${todo.subtasks.filter((s) => s.completed).length}/${todo.subtasks.length} steps`
              : '+ steps'}
          </button>
        </div>

        {showSubtasks && <Subtasks todo={todo} />}
      </div>

      {!selectMode && (
        <div className="todo-row__actions">
          <button type="button" className="todo-row__action" onClick={() => setIsEditing((v) => !v)} aria-label="Edit task">
            edit
          </button>
          <button
            type="button"
            className="todo-row__action todo-row__action--danger"
            onClick={() => onDelete(todo)}
            aria-label="Delete task"
          >
            delete
          </button>
        </div>
      )}
    </>
  );
}

function TodoRow({ todo, index, onDelete, selectMode, selected, onToggleSelect }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      className={`todo-row ${todo.completed ? 'is-completed' : ''} ${selected ? 'is-selected' : ''}`}
    >
      <TodoRowContent
        todo={todo}
        index={index}
        onDelete={onDelete}
        selectMode={selectMode}
        selected={selected}
        onToggleSelect={onToggleSelect}
      />
    </motion.li>
  );
}

function SortableTodoRow({ todo, index, onDelete, selectMode, selected, onToggleSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });

  return (
    <motion.li
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`todo-row ${todo.completed ? 'is-completed' : ''} ${isDragging ? 'is-dragging' : ''} ${selected ? 'is-selected' : ''}`}
    >
      <TodoRowContent
        todo={todo}
        index={index}
        onDelete={onDelete}
        selectMode={selectMode}
        selected={selected}
        onToggleSelect={onToggleSelect}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </motion.li>
  );
}

// ---------------------------------------------------------------------------
// List + controls
// ---------------------------------------------------------------------------
export default function Todo() {
  const dispatch = useDispatch();
  const { push } = useToast();
  const visibleTodos = useSelector(selectVisibleTodos);
  const allTodos = useSelector(selectAllTodos);
  const stats = useSelector(selectStats);
  const filter = useSelector(selectFilter);
  const search = useSelector(selectSearch);
  const sort = useSelector(selectSort);
  const tagFilter = useSelector(selectTagFilter);
  const allTags = useSelector(selectAllTags);
  const fileInputRef = useRef(null);

  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmImport, setConfirmImport] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkTagDraft, setBulkTagDraft] = useState('');

  const allCompleted = useMemo(() => stats.total > 0 && stats.completed === stats.total, [stats]);

  const dragEnabled =
    sort === SORTS.MANUAL && filter === FILTERS.ALL && tagFilter.length === 0 && !search.trim() && !selectMode;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = visibleTodos.map((t) => t.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    dispatch(reorderTodos(arrayMove(ids, oldIndex, newIndex)));
  };

  const handleDelete = (todo) => {
    dispatch(deleteTodo(todo.id));
    push({
      message: `Deleted "${todo.text.slice(0, 40)}${todo.text.length > 40 ? '…' : ''}"`,
      actionLabel: 'Undo',
      onAction: () => dispatch(undo()),
    });
  };

  const handleClearCompleted = () => {
    dispatch(clearCompleted());
    setConfirmClear(false);
    push({ message: 'Cleared completed entries.', actionLabel: 'Undo', onAction: () => dispatch(undo()) });
  };

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  };

  const toggleSelectId = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkComplete = () => {
    const ids = [...selectedIds];
    dispatch(bulkComplete(ids));
    push({ message: `Completed ${ids.length} entries.`, actionLabel: 'Undo', onAction: () => dispatch(undo()) });
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    const ids = [...selectedIds];
    dispatch(bulkDelete(ids));
    push({ message: `Deleted ${ids.length} entries.`, actionLabel: 'Undo', onAction: () => dispatch(undo()) });
    setSelectedIds(new Set());
  };

  const handleBulkTag = (e) => {
    e.preventDefault();
    if (!bulkTagDraft.trim()) return;
    const ids = [...selectedIds];
    dispatch(bulkAddTag({ ids, tag: bulkTagDraft }));
    push({ message: `Tagged ${ids.length} entries "#${bulkTagDraft.trim().toLowerCase()}".` });
    setBulkTagDraft('');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(allTodos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    push({ message: 'Exported entries to JSON.' });
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error('Expected an array of tasks');
        setConfirmImport(parsed);
      } catch (err) {
        push({ message: `Import failed: ${err.message}`, tone: 'danger' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImportNow = () => {
    dispatch(importTodos(confirmImport));
    push({ message: `Imported ${confirmImport.length} entries.`, actionLabel: 'Undo', onAction: () => dispatch(undo()) });
    setConfirmImport(null);
  };

  return (
    <section className="todo-panel">
      <div className="toolbar">
        <div className="toolbar__group">
          <button
            type="button"
            className="toolbar__mark-all"
            onClick={() => dispatch(toggleAll())}
            disabled={stats.total === 0}
            title={allCompleted ? 'Mark all active' : 'Mark all complete'}
          >
            <span className={`toolbar__mark-all-icon ${allCompleted ? 'is-all' : ''}`} />
          </button>

          <input
            id="search-input"
            type="search"
            className="toolbar__search"
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            placeholder="Search entries…"
            aria-label="Search tasks"
          />
        </div>

        <div className="toolbar__group toolbar__group--select">
          <select value={sort} onChange={(e) => dispatch(setSort(e.target.value))} aria-label="Sort tasks">
            <option value={SORTS.CREATED}>Newest first</option>
            <option value={SORTS.PRIORITY}>By priority</option>
            <option value={SORTS.DUE}>By due date</option>
            <option value={SORTS.ALPHA}>Alphabetical</option>
            <option value={SORTS.MANUAL}>Manual order (drag)</option>
          </select>
          <button
            type="button"
            className={`toolbar__select-toggle ${selectMode ? 'is-active' : ''}`}
            onClick={toggleSelectMode}
          >
            {selectMode ? 'Done selecting' : 'Select'}
          </button>
        </div>
      </div>

      <nav className="filter-tabs" aria-label="Filter tasks">
        {Object.values(FILTERS).map((f) => (
          <button
            key={f}
            className={`filter-tabs__tab ${filter === f ? 'is-active' : ''}`}
            onClick={() => dispatch(setFilter(f))}
          >
            {f}
          </button>
        ))}
        <span className="filter-tabs__spacer" />
        <button type="button" className="filter-tabs__util" onClick={handleExport}>
          export
        </button>
        <button type="button" className="filter-tabs__util" onClick={() => fileInputRef.current?.click()}>
          import
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
      </nav>

      {allTags.length > 0 && (
        <div className="tag-chips">
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`tag-chips__chip ${tagFilter.includes(tag) ? 'is-active' : ''}`}
              onClick={() => dispatch(toggleTagFilter(tag))}
            >
              #{tag}
            </button>
          ))}
          {tagFilter.length > 0 && (
            <button className="tag-chips__clear" onClick={() => dispatch(clearTagFilter())}>
              clear
            </button>
          )}
        </div>
      )}

      {dragEnabled && <p className="drag-hint">Drag the handle to reorder entries.</p>}

      {selectMode && selectedIds.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-bar__count">{selectedIds.size} selected</span>
          <button type="button" onClick={handleBulkComplete}>
            complete
          </button>
          <form className="bulk-bar__tag-form" onSubmit={handleBulkTag}>
            <input
              value={bulkTagDraft}
              onChange={(e) => setBulkTagDraft(e.target.value)}
              placeholder="add tag…"
              aria-label="Add tag to selected"
            />
          </form>
          <button type="button" className="bulk-bar__danger" onClick={handleBulkDelete}>
            delete
          </button>
        </div>
      )}

      <div className="todo-list-wrapper">
        {visibleTodos.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">
              {stats.total === 0 ? 'Nothing on the page yet.' : 'No entries match here.'}
            </p>
            <p className="empty-state__hint">
              {stats.total === 0
                ? 'Add your first task above to start the ledger.'
                : 'Try a different filter, tag, or search term.'}
            </p>
          </div>
        ) : dragEnabled ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visibleTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <ol className="todo-list">
                <AnimatePresence initial={false}>
                  {visibleTodos.map((todo, i) => (
                    <SortableTodoRow key={todo.id} todo={todo} index={i} onDelete={handleDelete} selectMode={false} />
                  ))}
                </AnimatePresence>
              </ol>
            </SortableContext>
          </DndContext>
        ) : (
          <ol className="todo-list">
            <AnimatePresence initial={false}>
              {visibleTodos.map((todo, i) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  index={i}
                  onDelete={handleDelete}
                  selectMode={selectMode}
                  selected={selectedIds.has(todo.id)}
                  onToggleSelect={toggleSelectId}
                />
              ))}
            </AnimatePresence>
          </ol>
        )}
      </div>

      <footer className="stats-bar">
        <span>
          <strong>{stats.active}</strong> open
        </span>
        <span className="stats-bar__divider">·</span>
        <span>
          <strong>{stats.completed}</strong> done
        </span>
        {stats.overdue > 0 && (
          <>
            <span className="stats-bar__divider">·</span>
            <span className="stats-bar__overdue">
              <strong>{stats.overdue}</strong> overdue
            </span>
          </>
        )}
        <button
          type="button"
          className="stats-bar__clear"
          onClick={() => setConfirmClear(true)}
          disabled={stats.completed === 0}
        >
          Clear completed
        </button>
      </footer>

      <ConfirmDialog
        open={confirmClear}
        title="Clear completed entries?"
        description={`This removes ${stats.completed} completed ${stats.completed === 1 ? 'entry' : 'entries'} from the ledger. You can undo it right after.`}
        confirmLabel="Clear"
        danger
        onConfirm={handleClearCompleted}
        onCancel={() => setConfirmClear(false)}
      />

      <ConfirmDialog
        open={Boolean(confirmImport)}
        title="Replace all entries?"
        description={`Importing will replace your current ${allTodos.length}-entry ledger with ${confirmImport?.length ?? 0} entries from the file. You can undo it right after.`}
        confirmLabel="Import"
        danger
        onConfirm={confirmImportNow}
        onCancel={() => setConfirmImport(null)}
      />
    </section>
  );
}
