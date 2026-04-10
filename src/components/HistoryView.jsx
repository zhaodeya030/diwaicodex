import { useState, useMemo } from 'react';
import { formatDate, formatMonth, formatWeek, getMonthKey, getWeekKey } from '../utils/dateUtils';

function HistoryTaskRow({ task, onDelete }) {
  return (
    <div className="history-task">
      <span className="history-check-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="history-task-text">{task.text}</span>
      <button
        className="task-action-btn delete-btn history-delete"
        onClick={() => onDelete(task.id)}
        aria-label="Delete"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function HistoryView({ getHistory, onDelete }) {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const history = getHistory();

  const dates = useMemo(
    () => Object.keys(history).sort((a, b) => (b > a ? 1 : -1)),
    [history]
  );

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

  const renderDates = (dateMap) =>
    Object.keys(dateMap)
      .sort((a, b) => (b > a ? 1 : -1))
      .map((date) => (
        <div key={date} className="history-subgroup">
          <h4 className="history-subdate">{formatDate(date)}</h4>
          {dateMap[date].map((task) => (
            <HistoryTaskRow key={task.id} task={task} onDelete={onDelete} />
          ))}
        </div>
      ));

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
          ? weeks.map((wk) => (
              <div key={wk} className="history-group">
                <h3 className="history-date">{formatWeek(wk)}</h3>
                {renderDates(weekGroups[wk])}
              </div>
            ))
          : months.map((mo) => (
              <div key={mo} className="history-group">
                <h3 className="history-date">{formatMonth(mo)}</h3>
                {renderDates(monthGroups[mo])}
              </div>
            ))}
      </div>
    </div>
  );
}
