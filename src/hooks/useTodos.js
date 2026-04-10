import { useState, useEffect, useCallback } from 'react';
import { getToday, generateId } from '../utils/dateUtils';

const STORAGE_KEY = 'dailydo_tasks';
const LAST_DATE_KEY = 'dailydo_last_date';

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function performRollover(tasks) {
  const today = getToday();
  const lastDate = localStorage.getItem(LAST_DATE_KEY);

  if (lastDate && lastDate !== today) {
    // New day: completed tasks from previous days stay as history,
    // uncompleted tasks simply carry over (no changes needed).
    // We just update the last date.
  }

  localStorage.setItem(LAST_DATE_KEY, today);
  return tasks;
}

export function useTodos() {
  const [tasks, setTasks] = useState(() => {
    const loaded = loadTasks();
    return performRollover(loaded);
  });

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Check for day change periodically (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getToday();
      const lastDate = localStorage.getItem(LAST_DATE_KEY);
      if (lastDate !== today) {
        localStorage.setItem(LAST_DATE_KEY, today);
        // Force re-render so "Done Today" section updates
        setTasks((prev) => [...prev]);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const today = getToday();

  const pendingTasks = tasks.filter((t) => !t.completed);
  const doneTodayTasks = tasks.filter(
    (t) => t.completed && t.completedAt === today
  );

  const addTask = useCallback((text) => {
    if (!text.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: generateId(),
        text: text.trim(),
        completed: false,
        createdAt: getToday(),
        completedAt: null,
      },
    ]);
  }, []);

  const editTask = useCallback((id, newText) => {
    if (!newText.trim()) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText.trim() } : t))
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const completeTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: true, completedAt: getToday() } : t
      )
    );
  }, []);

  // Group completed tasks by date for history
  const getHistory = useCallback(() => {
    const completed = tasks
      .filter((t) => t.completed && t.completedAt)
      .sort((a, b) => (b.completedAt > a.completedAt ? 1 : -1));

    const byDate = {};
    for (const task of completed) {
      if (!byDate[task.completedAt]) {
        byDate[task.completedAt] = [];
      }
      byDate[task.completedAt].push(task);
    }
    return byDate;
  }, [tasks]);

  return {
    pendingTasks,
    doneTodayTasks,
    addTask,
    editTask,
    deleteTask,
    completeTask,
    getHistory,
  };
}
