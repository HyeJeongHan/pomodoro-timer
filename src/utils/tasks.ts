import type { Task } from "../types";
import { today } from "./date";

export type { Task };

const taskKey = () => `pomodoro_tasks_${today()}`;

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(taskKey());
    if (raw) return JSON.parse(raw) as Task[];
  } catch {}
  return [];
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(taskKey(), JSON.stringify(tasks));
}
