import { useState, useMemo } from 'react';
import { formatDate, formatMonth, getMonthKey } from '../utils/dateUtils';

export default function HistoryView({ getHistory, onDelete }) {
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'month'
  const history = getHistory();

  const dates = useMemo(
    () => Object.keys(history).sort((a, b) => (b > a ? 1 : -1)),
    [history]
  );

  const monthGroups = useMemo(() => {
    const groups = {};
    for (const date of dates) {
      const monthKey = getMonthKey(date);
      if (!groups[monthKey]) groups[monthKey] = {};
      groups[monthKey][date] = history[date];
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
            className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Day
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
        {viewMode === 'day'
          ? dates.map((date) => (
              <div key={date} className="history-group">
                <h3 className="history-date">{formatDate(date)}</h3>
                {history[date].map((task) => (
                  <div key={task.id} className="history-task">
                    <span className="history-check-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="history-task-text">{task.text}</span>
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
                        <div key={task.id} className="history-task">
                          <span className="history-check-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          <span className="history-task-text">{task.text}</span>
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
                      ))}
                    </div>
                  ))}
              </div>
            ))}
      </div>
    </div>
  );
}
