import { create } from 'zustand';
import { Task, LoadLevel, PriorityLevel } from '../types';
import { ColorPair, DEFAULT_CONTEXT_OPTIONS } from '../constants/TaskOptions';
import {
  getAllTasks, saveTask, deleteTask as dbDeleteTask,
  getCustomContexts, saveCustomContexts,
  getContextColorOverrides, saveContextColorOverrides,
  getCustomColorPalette, saveCustomColorPalette,
  getHiddenDefaultContexts, saveHiddenDefaultContexts,
} from '../data/db';
import { normalizeTaskPositions, reorderByVisibleSwap } from '../utils/taskView';
import { useFilterStore } from './useFilterStore';

interface TaskStore {
  tasks: Task[];
  customContexts: string[];
  hiddenDefaultContexts: string[];
  contextColorOverrides: Record<string, ColorPair>;
  customColorPalette: ColorPair[];
  settingsLoaded: boolean;

  loadTasks: () => Promise<void>;
  addTask: (params: { title: string; load: LoadLevel; priority: PriorityLevel; context: string }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  saveEdit: (id: string, draft: { title: string; load: LoadLevel; priority: PriorityLevel; context: string }) => Promise<void>;
  snooze: (taskId: string, hours?: number) => Promise<void>;
  unsnooze: (taskId: string) => Promise<void>;
  unsnoozeAll: () => Promise<void>;
  moveTaskUp: (id: string, visibleTasks: Task[]) => Promise<void>;
  moveTaskDown: (id: string, visibleTasks: Task[]) => Promise<void>;
  clearAllTasks: () => Promise<void>;
  addCustomContext: (context: string) => Promise<void>;
  /** Deletes any context (default or custom) except 'general'. Migrates tasks to 'general'. */
  deleteContext: (context: string) => Promise<void>;
  /** Renames any context (default or custom) except 'general'. Migrates tasks. */
  renameContext: (oldName: string, newName: string) => Promise<void>;
  setContextColorOverride: (context: string, colorPair: ColorPair) => Promise<void>;
  removeContextColorOverride: (context: string) => Promise<void>;
  addToPalette: (colorPair: ColorPair) => Promise<void>;
  removeFromPalette: (index: number) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  customContexts: [],
  hiddenDefaultContexts: [],
  contextColorOverrides: {},
  customColorPalette: [],
  settingsLoaded: false,

  loadTasks: async () => {
    let storedTasks, storedCustomContexts, storedHidden, storedOverrides, storedPalette;
    try {
      [storedTasks, storedCustomContexts, storedHidden, storedOverrides, storedPalette] = await Promise.all([
        getAllTasks(),
        getCustomContexts(),
        getHiddenDefaultContexts(),
        getContextColorOverrides(),
        getCustomColorPalette(),
      ]);
    } catch (err) {
      throw new Error(`Storage unavailable: ${err instanceof Error ? err.message : err}`);
    }

    const normalizedTasks = storedTasks
      .map((task, index) => ({ ...task, position: task.position ?? index }))
      .sort((a, b) => a.position - b.position);

    set({
      tasks: normalizedTasks,
      customContexts: storedCustomContexts,
      hiddenDefaultContexts: storedHidden,
      contextColorOverrides: storedOverrides,
      customColorPalette: storedPalette,
      settingsLoaded: true,
    });
  },

  addTask: async ({ title, load, priority, context }) => {
    const { tasks } = get();
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(), load, priority, context,
      done: false, createdAt: Date.now(), snoozedUntil: null, position: 0,
    };
    const reorderedTasks = normalizeTaskPositions([newTask, ...tasks]);
    await Promise.all(reorderedTasks.map((task) => saveTask(task)));
    set({ tasks: reorderedTasks });
  },

  deleteTask: async (id) => {
    const { tasks } = get();
    const remainingTasks = normalizeTaskPositions(tasks.filter((task) => task.id !== id));
    await dbDeleteTask(id);
    await Promise.all(remainingTasks.map((task) => saveTask(task)));
    set({ tasks: remainingTasks });
  },

  toggleTask: async (id) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updatedTask: Task = { ...task, done: !task.done, snoozedUntil: task.done ? task.snoozedUntil : null };
    await saveTask(updatedTask);
    set({ tasks: tasks.map((t) => (t.id === id ? updatedTask : t)) });
  },

  saveEdit: async (id, draft) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updatedTask: Task = { ...task, title: draft.title.trim(), load: draft.load, priority: draft.priority, context: draft.context };
    await saveTask(updatedTask);
    set({ tasks: tasks.map((t) => (t.id === id ? updatedTask : t)) });
  },

  snooze: async (taskId, hours = 24) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.done) return;
    const updatedTask: Task = { ...task, snoozedUntil: Date.now() + hours * 60 * 60 * 1000 };
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
    const updatedTasks = tasks.map((t) =>
      t.snoozedUntil && t.snoozedUntil > now ? { ...t, snoozedUntil: null } : t
    );
    await Promise.all(updatedTasks.map((t) => saveTask(t)));
    set({ tasks: updatedTasks });
  },

  moveTaskUp: async (id, visibleTasks) => {
    const { tasks } = get();
    const reorderedTasks = reorderByVisibleSwap(tasks, visibleTasks, id, 'up');
    if (reorderedTasks === tasks) return;
    await Promise.all(reorderedTasks.map((t) => saveTask(t)));
    set({ tasks: reorderedTasks });
  },

  moveTaskDown: async (id, visibleTasks) => {
    const { tasks } = get();
    const reorderedTasks = reorderByVisibleSwap(tasks, visibleTasks, id, 'down');
    if (reorderedTasks === tasks) return;
    await Promise.all(reorderedTasks.map((t) => saveTask(t)));
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

  deleteContext: async (context) => {
    if (context === 'general') return;
    const { tasks, customContexts, hiddenDefaultContexts, contextColorOverrides } = get();

    // Migrate tasks
    const migratedTasks = tasks.map((t) => t.context === context ? { ...t, context: 'general' } : t);
    await Promise.all(migratedTasks.map((t) => saveTask(t)));

    // Remove from customContexts or add to hiddenDefaultContexts
    const isDefault = (DEFAULT_CONTEXT_OPTIONS as readonly string[]).includes(context);
    let updatedCustomContexts = customContexts;
    let updatedHidden = hiddenDefaultContexts;

    if (isDefault) {
      updatedHidden = [...hiddenDefaultContexts, context];
      await saveHiddenDefaultContexts(updatedHidden);
    } else {
      updatedCustomContexts = customContexts.filter((c) => c !== context);
      await saveCustomContexts(updatedCustomContexts);
    }

    // Remove override
    const updatedOverrides = { ...contextColorOverrides };
    delete updatedOverrides[context];
    await saveContextColorOverrides(updatedOverrides);

    // Reset filter if active
    const { filterContext, setFilterContext } = useFilterStore.getState();
    if (filterContext === context) setFilterContext('all');

    set({ tasks: migratedTasks, customContexts: updatedCustomContexts, hiddenDefaultContexts: updatedHidden, contextColorOverrides: updatedOverrides });
  },

  renameContext: async (oldName, newName) => {
    if (oldName === 'general') return;
    const { tasks, customContexts, hiddenDefaultContexts, contextColorOverrides } = get();
    const trimmed = newName.trim().toLowerCase();
    if (!trimmed || trimmed === oldName || customContexts.includes(trimmed)) return;

    // Migrate tasks
    const migratedTasks = tasks.map((t) => t.context === oldName ? { ...t, context: trimmed } : t);
    await Promise.all(migratedTasks.map((t) => saveTask(t)));

    // Update context lists
    const isDefault = (DEFAULT_CONTEXT_OPTIONS as readonly string[]).includes(oldName);
    let updatedCustomContexts = customContexts;
    let updatedHidden = hiddenDefaultContexts;

    if (isDefault) {
      updatedCustomContexts = [...customContexts, trimmed];
      updatedHidden = [...hiddenDefaultContexts, oldName];
      await saveCustomContexts(updatedCustomContexts);
      await saveHiddenDefaultContexts(updatedHidden);
    } else {
      updatedCustomContexts = customContexts.map((c) => (c === oldName ? trimmed : c));
      await saveCustomContexts(updatedCustomContexts);
    }

    // Migrate override key
    const updatedOverrides = { ...contextColorOverrides };
    if (updatedOverrides[oldName]) {
      updatedOverrides[trimmed] = updatedOverrides[oldName];
      delete updatedOverrides[oldName];
    }
    await saveContextColorOverrides(updatedOverrides);

    // Update filter if active
    const { filterContext, setFilterContext } = useFilterStore.getState();
    if (filterContext === oldName) setFilterContext(trimmed);

    set({ tasks: migratedTasks, customContexts: updatedCustomContexts, hiddenDefaultContexts: updatedHidden, contextColorOverrides: updatedOverrides });
  },

  setContextColorOverride: async (context, colorPair) => {
    const { contextColorOverrides } = get();
    const updated = { ...contextColorOverrides, [context]: colorPair };
    await saveContextColorOverrides(updated);
    set({ contextColorOverrides: updated });
  },

  removeContextColorOverride: async (context) => {
    const { contextColorOverrides } = get();
    const updated = { ...contextColorOverrides };
    delete updated[context];
    await saveContextColorOverrides(updated);
    set({ contextColorOverrides: updated });
  },

  addToPalette: async (colorPair) => {
    const { customColorPalette } = get();
    const updated = [...customColorPalette, colorPair];
    await saveCustomColorPalette(updated);
    set({ customColorPalette: updated });
  },

  removeFromPalette: async (index) => {
    const { customColorPalette } = get();
    const updated = customColorPalette.filter((_, i) => i !== index);
    await saveCustomColorPalette(updated);
    set({ customColorPalette: updated });
  },
}));