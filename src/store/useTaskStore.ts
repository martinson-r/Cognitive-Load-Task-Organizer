import { create } from 'zustand';
import { Task, LoadLevel, PriorityLevel } from '../types';
import {
  getAllTasks,
  saveTask,
  deleteTask as dbDeleteTask,
  getCustomContexts,
  saveCustomContexts,
} from '../data/db';
import { normalizeTaskPositions, reorderByVisibleSwap } from '../utils/taskView';

interface TaskStore {
  tasks: Task[];
  customContexts: string[];
  settingsLoaded: boolean;

  loadTasks: () => Promise<void>;
  addTask: (params: {
    title: string;
    load: LoadLevel;
    priority: PriorityLevel;
    context: string;
  }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  saveEdit: (id: string, draft: {
    title: string;
    load: LoadLevel;
    priority: PriorityLevel;
    context: string;
  }) => Promise<void>;
  snooze: (taskId: string, hours?: number) => Promise<void>;
  unsnooze: (taskId: string) => Promise<void>;
  unsnoozeAll: () => Promise<void>;
  moveTaskUp: (id: string, visibleTasks: Task[]) => Promise<void>;
  moveTaskDown: (id: string, visibleTasks: Task[]) => Promise<void>;
  clearAllTasks: () => Promise<void>;
  addCustomContext: (context: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  customContexts: [],
  settingsLoaded: false,

  loadTasks: async () => {
    const [storedTasks, storedCustomContexts] = await Promise.all([
      getAllTasks(),
      getCustomContexts(),
    ]);

    const normalizedTasks = storedTasks
      .map((task, index) => ({
        ...task,
        position: task.position ?? index,
      }))
      .sort((a, b) => a.position - b.position);

    set({
      tasks: normalizedTasks,
      customContexts: storedCustomContexts,
      settingsLoaded: true,
    });
  },

  addTask: async ({ title, load, priority, context }) => {
    const { tasks } = get();

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      load,
      priority,
      context,
      done: false,
      createdAt: Date.now(),
      snoozedUntil: null,
      position: 0,
    };

    const reorderedTasks = normalizeTaskPositions([newTask, ...tasks]);
    await Promise.all(reorderedTasks.map((task) => saveTask(task)));
    set({ tasks: reorderedTasks });
  },

  deleteTask: async (id) => {
    const { tasks } = get();
    const remainingTasks = normalizeTaskPositions(
      tasks.filter((task) => task.id !== id)
    );
    await dbDeleteTask(id);
    await Promise.all(remainingTasks.map((task) => saveTask(task)));
    set({ tasks: remainingTasks });
  },

  toggleTask: async (id) => {
    const { tasks } = get();
    const taskToUpdate = tasks.find((task) => task.id === id);
    if (!taskToUpdate) return;

    const updatedTask: Task = {
      ...taskToUpdate,
      done: !taskToUpdate.done,
      snoozedUntil: taskToUpdate.done ? taskToUpdate.snoozedUntil : null,
    };

    await saveTask(updatedTask);
    set({ tasks: tasks.map((task) => (task.id === id ? updatedTask : task)) });
  },

  saveEdit: async (id, draft) => {
    const { tasks } = get();
    const taskToUpdate = tasks.find((task) => task.id === id);
    if (!taskToUpdate) return;

    const updatedTask: Task = {
      ...taskToUpdate,
      title: draft.title.trim(),
      load: draft.load,
      priority: draft.priority,
      context: draft.context,
    };

    await saveTask(updatedTask);
    set({ tasks: tasks.map((task) => (task.id === id ? updatedTask : task)) });
  },

  snooze: async (taskId, hours = 24) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.done) return;

    const updatedTask: Task = {
      ...task,
      snoozedUntil: Date.now() + hours * 60 * 60 * 1000,
    };

    await saveTask(updatedTask);
    set({ tasks: tasks.map((t) => (t.id === taskId ? updatedTask : t)) });
  },

  unsnooze: async (taskId) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask: Task = { ...task, snoozedUntil: null };
    await saveTask(updatedTask);
    set({ tasks: tasks.map((t) => (t.id === taskId ? updatedTask : t)) });
  },

  unsnoozeAll: async () => {
    const { tasks } = get();
    const now = Date.now();
    const updatedTasks = tasks.map((task) =>
      task.snoozedUntil && task.snoozedUntil > now
        ? { ...task, snoozedUntil: null }
        : task
    );
    await Promise.all(updatedTasks.map((t) => saveTask(t)));
    set({ tasks: updatedTasks });
  },

  moveTaskUp: async (id, visibleTasks) => {
    const { tasks } = get();
    const reorderedTasks = reorderByVisibleSwap(tasks, visibleTasks, id, 'up');
    if (reorderedTasks === tasks) return;
    await Promise.all(reorderedTasks.map((task) => saveTask(task)));
    set({ tasks: reorderedTasks });
  },

  moveTaskDown: async (id, visibleTasks) => {
    const { tasks } = get();
    const reorderedTasks = reorderByVisibleSwap(tasks, visibleTasks, id, 'down');
    if (reorderedTasks === tasks) return;
    await Promise.all(reorderedTasks.map((task) => saveTask(task)));
    set({ tasks: reorderedTasks });
  },

  clearAllTasks: async () => {
    const { tasks } = get();
    await Promise.all(tasks.map((t) => dbDeleteTask(t.id)));
    set({ tasks: [] });
  },

  addCustomContext: async (context) => {
    const { customContexts } = get();
    const trimmed = context.trim().toLowerCase();
    if (!trimmed || customContexts.includes(trimmed)) return;

    const updated = [...customContexts, trimmed];
    await saveCustomContexts(updated);
    set({ customContexts: updated });
  },
}));