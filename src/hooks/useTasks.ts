import { useState } from "react";
import { loadTasks, saveTasks, type Task } from "../utils/tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const update = (next: Task[]) => {
    setTasks(next);
    saveTasks(next);
  };

  const addTask = (text: string) => {
    if (!text.trim()) return;
    update([...tasks, { id: Date.now().toString(), text: text.trim(), done: false, sessions: 0 }]);
  };

  const toggleTask = (id: string) =>
    update(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id: string) => {
    if (activeTaskId === id) setActiveTaskId(null);
    update(tasks.filter((t) => t.id !== id));
  };

  const addSessionToTask = (id: string) =>
    update(tasks.map((t) => (t.id === id ? { ...t, sessions: (t.sessions ?? 0) + 1 } : t)));

  const selectTask = (id: string) =>
    setActiveTaskId((prev) => (prev === id ? null : id));

  const clearActiveTask = () => setActiveTaskId(null);

  const addAndSelectTask = (text: string): string => {
    const id = Date.now().toString();
    update([...tasks, { id, text: text.trim(), done: false, sessions: 0 }]);
    setActiveTaskId(id);
    return id;
  };

  return { tasks, addTask, toggleTask, deleteTask, activeTaskId, selectTask, clearActiveTask, addSessionToTask, addAndSelectTask };
}
