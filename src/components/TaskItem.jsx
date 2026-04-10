import { useState } from 'react';

export default function TaskItem({
  task,
  onComplete,
  onEdit,
  onDelete,
  showCheckbox = true,
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSave = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      onEdit(task.id, editText);
    } else {
      setEditText(task.text);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditText(task.text);
      setEditing(false);
    }
  };

  return (
    <div className={`task-item ${task.completed ? 'task-completed' : ''}`}>
      {showCheckbox && (
        <button
          className="task-checkbox"
          onClick={() => onComplete(task.id)}
          aria-label="Complete task"
        >
          <span className="checkbox-circle" />
        </button>
      )}

      {editing ? (
        <input
          className="task-edit-input"
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          maxLength={200}
        />
      ) : (
        <span
          className="task-text"
          onDoubleClick={() => {
            if (!task.completed) {
              setEditing(true);
            }
          }}
          title={task.completed ? undefined : 'Double-click to edit'}
        >
          {task.text}
        </span>
      )}

      <div className="task-actions">
        {!task.completed && !editing && (
          <button
            className="task-action-btn edit-btn"
            onClick={() => setEditing(true)}
            aria-label="Edit task"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
        )}
        <button
          className="task-action-btn delete-btn"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
