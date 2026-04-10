import { useState } from 'react';

export default function AddTask({ onAdd }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a task..."
        className="add-task-input"
        maxLength={200}
      />
      <button type="submit" className="add-task-btn" disabled={!text.trim()}>
        +
      </button>
    </form>
  );
}
