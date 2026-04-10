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
  localStorage.setItem(LAST_DATE_KEY, today);
  return tasks;
}

export function useTodos() {
  const [tasks, setTasks] = useState(() => performRollover(loadTasks()));

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Refresh "Done Today" if the day changes while app is open
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getToday();
      const lastDate = localStorage.getItem(LAST_DATE_KEY);
      if (lastDate !== today) {
        localStorage.setItem(LAST_DATE_KEY, today);
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

  // Add a brand new task
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

  // Check off a task → moves to Done Today
  const completeTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: true, completedAt: getToday() } : t
      )
    );
  }, []);

  // Advance a task to the next step:
  //   1. Archive current task text as a new "completed" entry (shows in Done Today)
  //   2. Update the original task with the new text (stays in To Do)
  const addUpdate = useCallback((taskId, newText) => {
    if (!newText.trim()) return;
    const today = getToday();
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      const archivedEntry = {
        id: generateId(),
        text: task.text,
        completed: true,
        createdAt: task.createdAt,
        completedAt: today,
      };

      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, text: newText.trim() } : t
      );

      return [...updated, archivedEntry];
    });
  }, []);

  // Group completed tasks by completedAt date for History
  const getHistory = useCallback(() => {
    const completed = tasks
      .filter((t) => t.completed && t.completedAt)
      .sort((a, b) => (b.completedAt > a.completedAt ? 1 : -1));

    const byDate = {};
    for (const task of completed) {
      if (!byDate[task.completedAt]) byDate[task.completedAt] = [];
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
    addUpdate,
    getHistory,
  };
}
