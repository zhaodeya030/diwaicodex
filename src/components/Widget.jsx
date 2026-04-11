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

  // LogicalSize lives in @tauri-apps/api/window (not /dpi) in Tauri 2.0.x
  const toggleCollapsed = async () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('widget_collapsed', String(next));

    try {
      const { getCurrentWindow, LogicalSize } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();

      if (next) {
        // Collapsing — save current size, shrink to header bar only
        const phys = await win.innerSize();
        const scale = await win.scaleFactor();
        const logW = Math.round(phys.width / scale);
        const logH = Math.round(phys.height / scale);
        localStorage.setItem('widget_expanded_size', JSON.stringify({ w: logW, h: logH }));
        await win.setSize(new LogicalSize(logW, 52));
      } else {
        // Expanding — restore saved size
        const saved = JSON.parse(localStorage.getItem('widget_expanded_size') || 'null');
        await win.setSize(new LogicalSize(saved?.w ?? 300, saved?.h ?? 360));
      }
    } catch {
      // Browser mode — no window resize needed
    }
  };

  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch {
      // ignore in browser mode
    }
  };

  // SE-corner resize grip
  const handleResizeMouseDown = async (e) => {
    if (!document.documentElement.dataset.tauri) return;
    e.preventDefault();
    try {
      const { getCurrentWindow, LogicalSize } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();

      // Tauri 2.1+: native OS drag-resize
      if (typeof win.startDragResize === 'function') {
        await win.startDragResize('SouthEast');
        return;
      }

      // Fallback: manual resize via setSize
      const phys = await win.innerSize();
      const scale = await win.scaleFactor();
      const initW = phys.width / scale;
      const initH = phys.height / scale;
      const startX = e.screenX;
      const startY = e.screenY;

      const onMove = async (me) => {
        const newW = Math.max(200, Math.round(initW + (me.screenX - startX)));
        const newH = Math.max(52, Math.round(initH + (me.screenY - startY)));
        await win.setSize(new LogicalSize(newW, newH));
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`widget ${collapsed ? 'widget-collapsed' : ''}`}>
      {/* Header — drag region for moving the window */}
      <div className="widget-header" data-tauri-drag-region>
        <div className="widget-header-left">
          {!collapsed && view === 'history' && (
            <button
              className="widget-back-btn"
              onClick={() => setView('main')}
              aria-label="Back"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button
            className="widget-close-btn"
            onClick={handleClose}
            aria-label="Close"
            title="Close DailyDo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
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

      {/* SE corner resize grip */}
      <div
        className="resize-grip"
        onMouseDown={handleResizeMouseDown}
        aria-hidden="true"
      />
    </div>
  );
}
