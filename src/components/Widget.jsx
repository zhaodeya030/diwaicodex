import { useState } from 'react';
import TodoSection from './TodoSection';
import DoneSection from './DoneSection';
import HistoryView from './HistoryView';

export default function Widget({
  pendingTasks,
  doneTodayTasks,
  onAdd,
  onComplete,
  onEdit,
  onDelete,
  onAddUpdate,
  getHistory,
}) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('widget_collapsed') === 'true'
  );
  const [view, setView] = useState('main'); // 'main' | 'history'

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('widget_collapsed', String(next));
  };

  return (
    <div className={`widget ${collapsed ? 'widget-collapsed' : ''}`}>
      {/* Header — also the drag region for Tauri */}
      <div className="widget-header" data-tauri-drag-region>
        <div className="widget-header-left">
          {!collapsed && view === 'history' && (
            <button
              className="widget-back-btn"
              onClick={() => setView('main')}
              aria-label="Back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <h1 className="widget-title" data-tauri-drag-region>DailyDo</h1>
        </div>
        <div className="widget-header-right">
          {!collapsed && view === 'main' && (
            <button
              className="widget-history-btn"
              onClick={() => setView('history')}
              aria-label="History"
              title="View history"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
          )}
          <button
            className="widget-collapse-btn"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: collapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="widget-body">
          {view === 'main' ? (
            <>
              <TodoSection
                tasks={pendingTasks}
                onAdd={onAdd}
                onComplete={onComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddUpdate={onAddUpdate}
              />
              <div className="section-divider" />
              <DoneSection tasks={doneTodayTasks} onDelete={onDelete} />
            </>
          ) : (
            <HistoryView getHistory={getHistory} onDelete={onDelete} />
          )}
        </div>
      )}

      {collapsed && (
        <div className="widget-collapsed-summary" data-tauri-drag-region>
          {pendingTasks.length > 0
            ? `${pendingTasks.length} task${pendingTasks.length > 1 ? 's' : ''} remaining`
            : 'All done today!'}
        </div>
      )}
    </div>
  );
}
