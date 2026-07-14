import { useEffect, Suspense, lazy } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import AddForm from './components/AddForm';
import Todo from './components/Todo';
import ShortcutsHelp from './components/ShortcutsHelp';

// three.js + react-three-fiber are heavy — split into their own chunk and
// only fetched once the page actually needs to paint the 3D scene.
const ProgressScene = lazy(() => import('./components/ProgressScene'));
import { selectStats, toggleAll, selectCanUndo, selectCanRedo } from './features/todo/todoSlice';
import { undo, redo } from './app/undoable';
import { selectTheme, toggleTheme, setShortcutsOpen } from './features/ui/uiSlice';
import { useToast } from './app/ToastContext';
import './App.css';

function useGlobalShortcuts() {
  const dispatch = useDispatch();
  const { push } = useToast();

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const mod = e.metaKey || e.ctrlKey;

      // Undo/redo work even while a field is focused, since they're the
      // universal "get me out of this" shortcut people reach for by habit.
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch(redo());
          push({ message: 'Redone.', duration: 1600 });
        } else {
          dispatch(undo());
          push({ message: 'Undone.', duration: 1600 });
        }
        return;
      }

      if (e.key === '?' && !typing) {
        e.preventDefault();
        dispatch(setShortcutsOpen(true));
        return;
      }

      if (typing) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        document.getElementById('add-form-input')?.focus();
      } else if (e.key === '/') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      } else if (e.key === 'A' && e.shiftKey) {
        e.preventDefault();
        dispatch(toggleAll());
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch, push]);
}

export default function App() {
  const stats = useSelector(selectStats);
  const theme = useSelector(selectTheme);
  const canUndo = useSelector(selectCanUndo);
  const canRedo = useSelector(selectCanRedo);
  const dispatch = useDispatch();

  useGlobalShortcuts();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page">
      <div className="page__spine" aria-hidden="true" />

      <div className="page__content">
        <header className="masthead">
          <div className="masthead__top">
            <span className="masthead__eyebrow">Field Notes</span>
            <div className="masthead__top-actions">
              <span className="masthead__date">{today}</span>
              <button
                type="button"
                className="theme-toggle"
                onClick={() => dispatch(undo())}
                disabled={!canUndo}
                aria-label="Undo last change"
                title="Undo (Ctrl+Z)"
              >
                ↺
              </button>
              <button
                type="button"
                className="theme-toggle"
                onClick={() => dispatch(redo())}
                disabled={!canRedo}
                aria-label="Redo last change"
                title="Redo (Ctrl+Shift+Z)"
              >
                ↻
              </button>
              <button
                type="button"
                className="theme-toggle"
                onClick={() => dispatch(toggleTheme())}
                aria-label="Toggle dark mode"
                title="Toggle dark mode"
              >
                {theme === 'dark' ? '☀' : '☾'}
              </button>
              <button
                type="button"
                className="theme-toggle"
                onClick={() => dispatch(setShortcutsOpen(true))}
                aria-label="Show keyboard shortcuts"
                title="Keyboard shortcuts (?)"
              >
                ?
              </button>
            </div>
          </div>

          <div className="masthead__hero">
            <div>
              <h1 className="masthead__title">Today's Ledger</h1>
              <motion.p
                key={stats.total === 0 ? 'empty' : `${stats.active}-${stats.total}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="masthead__subtitle"
              >
                {stats.total === 0
                  ? 'A blank page. Write down what needs doing.'
                  : `${stats.active} open of ${stats.total} entries.`}
              </motion.p>
            </div>
            <Suspense fallback={<div className="progress-scene progress-scene--loading" />}>
              <ProgressScene active={stats.active} completed={stats.completed} theme={theme} />
            </Suspense>
          </div>
        </header>

        <main>
          <AddForm />
          <Todo />
        </main>

        <footer className="page-footer">
          <span>Stored locally in this browser — no account, no server.</span>
        </footer>
      </div>

      <ShortcutsHelp />
    </div>
  );
}
