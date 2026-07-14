import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { addTodo, PRIORITY } from '../features/todo/todoSlice';

export default function AddForm() {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(PRIORITY.MEDIUM);
  const [tags, setTags] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    dispatch(
      addTodo({
        text: trimmed,
        priority,
        tags,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      })
    );

    setText('');
    setTags('');
    setDueDate('');
    setPriority(PRIORITY.MEDIUM);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setExpanded(false);
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form__row">
        <span className="add-form__mark" aria-hidden="true">+</span>
        <input
          id="add-form-input"
          ref={inputRef}
          className="add-form__input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
          onKeyDown={handleKeyDown}
          placeholder="Write the next entry…"
          aria-label="New task text"
          maxLength={280}
        />
        <button
          type="button"
          className="add-form__toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label="Toggle task details"
        >
          {expanded ? '−' : '⋯'}
        </button>
        <motion.button
          type="submit"
          className="add-form__submit"
          whileTap={{ scale: 0.92 }}
        >
          Add
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className="add-form__details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="add-form__details-inner">
              <label className="add-form__field">
                <span>Priority</span>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value={PRIORITY.LOW}>Low</option>
                  <option value={PRIORITY.MEDIUM}>Medium</option>
                  <option value={PRIORITY.HIGH}>High</option>
                </select>
              </label>

              <label className="add-form__field">
                <span>Tags</span>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="work, urgent"
                  maxLength={60}
                />
              </label>

              <label className="add-form__field">
                <span>Due</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
