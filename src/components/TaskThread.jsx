import { useState } from 'react';
import { formatDate } from '../utils/dateUtils';

export default function TaskThread({ task, onAddLog }) {
  const [inputText, setInputText] = useState('');
  const logs = task.logs || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddLog(task.id, inputText.trim());
    setInputText('');
  };

  return (
    <div className="task-thread">
      {logs.length > 0 && (
        <div className="thread-logs">
          {logs.map((log) => (
            <div key={log.id} className="thread-log-entry">
              <span className="thread-dot" />
              <span className="thread-log-date">{formatDate(log.date)}</span>
              <span className="thread-log-text">{log.text}</span>
            </div>
          ))}
        </div>
      )}
      <form className="thread-add-form" onSubmit={handleSubmit}>
        <input
          className="thread-add-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add an update..."
          maxLength={300}
          autoFocus
        />
        <button
          type="submit"
          className="thread-add-btn"
          disabled={!inputText.trim()}
        >
          +
        </button>
      </form>
    </div>
  );
}
