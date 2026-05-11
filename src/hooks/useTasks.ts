import { useState } from "react";
import { loadTasks, saveTasks, type Task } from "../utils/tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  const update = (next: Task[]) => {
    setTasks(next);
    saveTasks(next);
  };

  const addTask = (text: string) => {
    if (!text.trim()) return;
    update([...tasks, { id: Date.now().toString(), text: text.trim(), done: false }]);
  };

  const toggleTask = (id: string) =>
    update(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id: string) =>
    update(tasks.filter((t) => t.id !== id));

  return { tasks, addTask, toggleTask, deleteTask };
}
