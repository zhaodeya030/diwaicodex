import { useState } from 'react';

export default function TaskItem({
  task,
  onComplete,
  onEdit,
  onDelete,
  onAddUpdate,
  showCheckbox = true,
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [updating, setUpdating] = useState(false);
  const [updateText, setUpdateText] = useState('');

  const handleSave = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      onEdit(task.id, editText);
    } else {
      setEditText(task.text);
    }
    setEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditText(task.text);
      setEditing(false);
    }
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    onAddUpdate(task.id, updateText.trim());
    setUpdateText('');
    setUpdating(false);
  };

  const handleUpdateKeyDown = (e) => {
    if (e.key === 'Escape') {
      setUpdateText('');
      setUpdating(false);
    }
  };

  return (
    <div className="task-item-wrapper">
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
            onKeyDown={handleEditKeyDown}
            autoFocus
            maxLength={200}
          />
        ) : (
          <span
            className="task-text"
            onDoubleClick={() => {
              if (!task.completed) setEditing(true);
            }}
            title={task.completed ? undefined : 'Double-click to edit'}
          >
            {task.text}
          </span>
        )}

        <div className="task-actions">
          {/* Update button: advance this task to its next step */}
          {!task.completed && !editing && onAddUpdate && (
            <button
              className={`task-action-btn update-btn ${updating ? 'update-btn-active' : ''}`}
              onClick={() => {
                setUpdating(!updating);
                setUpdateText('');
              }}
              aria-label="Advance to next step"
              title="Record next step (archives current)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          )}
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

      {/* Inline "next step" form — appears below the task row */}
      {updating && (
        <form className="task-update-form" onSubmit={handleUpdateSubmit}>
          <span className="update-form-label">Next step</span>
          <input
            className="task-update-input"
            type="text"
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            onKeyDown={handleUpdateKeyDown}
            placeholder="What comes next?"
            autoFocus
            maxLength={200}
          />
          <button
            type="submit"
            className="task-update-submit"
            disabled={!updateText.trim()}
            title="Submit — current task moves to Done Today"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
