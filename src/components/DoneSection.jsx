import TaskItem from './TaskItem';

export default function DoneSection({ tasks, onDelete, onAddLog }) {
  return (
    <div className="section">
      <h2 className="section-title">
        Done Today
        {tasks.length > 0 && (
          <span className="done-count">{tasks.length}</span>
        )}
      </h2>
      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="empty-hint">Complete a task to see it here</p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              showCheckbox={false}
              onEdit={() => {}}
              onDelete={onDelete}
              onAddLog={onAddLog}
            />
          ))
        )}
      </div>
    </div>
  );
}
