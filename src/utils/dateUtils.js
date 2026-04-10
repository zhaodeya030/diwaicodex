export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonth(dateStr) {
  const date = new Date(dateStr + '-01T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

export function getMonthKey(dateStr) {
  return dateStr.slice(0, 7);
}

// Returns the Monday of the week for a given date string (YYYY-MM-DD)
export function getWeekKey(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay(); // 0=Sun, 1=Mon, ...
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysToMonday);
  return monday.toISOString().split('T')[0];
}

// "Apr 7 – Apr 13" from a monday date string
export function formatWeek(mondayStr) {
  const start = new Date(mondayStr + 'T00:00:00');
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startFmt = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endFmt = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startFmt} – ${endFmt}`;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
