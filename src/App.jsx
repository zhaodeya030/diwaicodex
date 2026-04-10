import Widget from './components/Widget';
import { useTodos } from './hooks/useTodos';
import './App.css';

export default function App() {
  const {
    pendingTasks,
    doneTodayTasks,
    addTask,
    editTask,
    deleteTask,
    completeTask,
    addLog,
    getHistory,
  } = useTodos();

  return (
    <div className="app">
      <Widget
        pendingTasks={pendingTasks}
        doneTodayTasks={doneTodayTasks}
        onAdd={addTask}
        onComplete={completeTask}
        onEdit={editTask}
        onDelete={deleteTask}
        onAddLog={addLog}
        getHistory={getHistory}
      />
    </div>
  );
}
