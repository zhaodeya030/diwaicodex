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

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
