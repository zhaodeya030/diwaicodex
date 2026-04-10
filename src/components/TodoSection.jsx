import TaskItem from './TaskItem';
import AddTask from './AddTask';

export default function TodoSection({
  tasks,
  onAdd,
  onComplete,
  onEdit,
  onDelete,
  onAddUpdate,
}) {
  return (
    <div className="section">
      <h2 className="section-title">To Do</h2>
      <AddTask onAdd={onAdd} />
      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="empty-hint">Nothing to do — enjoy your day!</p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddUpdate={onAddUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
