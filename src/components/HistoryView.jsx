import { useState, useMemo } from 'react';
import { formatDate, formatMonth, formatWeek, getMonthKey, getWeekKey } from '../utils/dateUtils';
import TaskThread from './TaskThread';

function HistoryTaskRow({ task, onDelete, onAddLog }) {
  const [threadOpen, setThreadOpen] = useState(false);
  const logCount = (task.logs || []).length;

  return (
    <div className="history-task-wrapper">
      <div className="history-task">
        <span className="history-check-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span className="history-task-text">{task.text}</span>
        <div className="task-actions">
          <button
            className={`task-action-btn thread-btn ${threadOpen ? 'thread-btn-active' : ''}`}
            onClick={() => setThreadOpen(!threadOpen)}
            aria-label="View updates"
            title="View / add updates"
          >
            {logCount > 0 && (
              <span className="thread-count-badge">{logCount}</span>
            )}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </button>
          <button
            className="task-action-btn delete-btn"
            onClick={() => onDelete(task.id)}
            aria-label="Delete"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      {threadOpen && (
        <TaskThread task={task} onAddLog={onAddLog} />
      )}
    </div>
  );
}

export default function HistoryView({ getHistory, onDelete, onAddLog }) {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const history = getHistory();

  const dates = useMemo(
    () => Object.keys(history).sort((a, b) => (b > a ? 1 : -1)),
    [history]
  );

  // Group by week (key = Monday date)
  const weekGroups = useMemo(() => {
    const groups = {};
    for (const date of dates) {
      const wk = getWeekKey(date);
      if (!groups[wk]) groups[wk] = {};
      groups[wk][date] = history[date];
    }
    return groups;
  }, [dates, history]);

  const weeks = useMemo(
    () => Object.keys(weekGroups).sort((a, b) => (b > a ? 1 : -1)),
    [weekGroups]
  );

  // Group by month
  const monthGroups = useMemo(() => {
    const groups = {};
    for (const date of dates) {
      const mk = getMonthKey(date);
      if (!groups[mk]) groups[mk] = {};
      groups[mk][date] = history[date];
    }
    return groups;
  }, [dates, history]);

  const months = useMemo(
    () => Object.keys(monthGroups).sort((a, b) => (b > a ? 1 : -1)),
    [monthGroups]
  );

  if (dates.length === 0) {
    return (
      <div className="history-view">
        <div className="history-header">
          <h2 className="section-title">History</h2>
        </div>
        <p className="empty-hint">No completed tasks yet</p>
      </div>
    );
  }

  return (
    <div className="history-view">
      <div className="history-header">
        <h2 className="section-title">History</h2>
        <div className="history-toggle">
          <button
            className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button
            className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="history-content">
        {viewMode === 'week'
          ? weeks.map((weekKey) => (
              <div key={weekKey} className="history-group">
                <h3 className="history-date">{formatWeek(weekKey)}</h3>
                {Object.keys(weekGroups[weekKey])
                  .sort((a, b) => (b > a ? 1 : -1))
                  .map((date) => (
                    <div key={date} className="history-subgroup">
                      <h4 className="history-subdate">{formatDate(date)}</h4>
                      {weekGroups[weekKey][date].map((task) => (
                        <HistoryTaskRow
                          key={task.id}
                          task={task}
                          onDelete={onDelete}
                          onAddLog={onAddLog}
                        />
                      ))}
                    </div>
                  ))}
              </div>
            ))
          : months.map((month) => (
              <div key={month} className="history-group">
                <h3 className="history-date">{formatMonth(month)}</h3>
                {Object.keys(monthGroups[month])
                  .sort((a, b) => (b > a ? 1 : -1))
                  .map((date) => (
                    <div key={date} className="history-subgroup">
                      <h4 className="history-subdate">{formatDate(date)}</h4>
                      {monthGroups[month][date].map((task) => (
                        <HistoryTaskRow
                          key={task.id}
                          task={task}
                          onDelete={onDelete}
                          onAddLog={onAddLog}
                        />
                      ))}
                    </div>
                  ))}
              </div>
            ))}
      </div>
    </div>
  );
}
