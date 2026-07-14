import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { selectShortcutsOpen, setShortcutsOpen } from '../features/ui/uiSlice';

const SHORTCUTS = [
  { keys: ['N'], desc: 'Focus the new-task field' },
  { keys: ['/'], desc: 'Focus search' },
  { keys: ['Shift', 'A'], desc: 'Toggle mark all complete' },
  { keys: ['Ctrl', 'Z'], desc: 'Undo last change' },
  { keys: ['Ctrl', 'Shift', 'Z'], desc: 'Redo' },
  { keys: ['Esc'], desc: 'Cancel edit / close dialogs' },
  { keys: ['?'], desc: 'Toggle this panel' },
];

export default function ShortcutsHelp() {
  const open = useSelector(selectShortcutsOpen);
  const dispatch = useDispatch();
  const close = () => dispatch(setShortcutsOpen(false));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="modal modal--shortcuts"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal__title">Keyboard shortcuts</h2>
            <ul className="shortcuts-list">
              {SHORTCUTS.map((s) => (
                <li key={s.desc} className="shortcuts-list__row">
                  <span className="shortcuts-list__keys">
                    {s.keys.map((k) => (
                      <kbd key={k}>{k}</kbd>
                    ))}
                  </span>
                  <span className="shortcuts-list__desc">{s.desc}</span>
                </li>
              ))}
            </ul>
            <div className="modal__actions">
              <button type="button" className="modal__btn modal__btn--primary" onClick={close}>
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
