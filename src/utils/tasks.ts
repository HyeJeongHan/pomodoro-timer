export type Task = {
  id: string;
  text: string;
  done: boolean;
};

const key = () => `pomodoro_tasks_${new Date().toISOString().slice(0, 10)}`;

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(key());
    if (raw) return JSON.parse(raw) as Task[];
  } catch {}
  return [];
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(key(), JSON.stringify(tasks));
}
