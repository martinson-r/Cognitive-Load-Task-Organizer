import { getAllTasks, saveTask, deleteTask, getSetting, saveSetting, saveCustomContexts } from '../data/db';
import { Task } from '../types';

const SETTING_KEYS = [
  'advancedFeaturesEnabled',
  'showSnoozedTasks',
  'showCompleted',
  'filterLoad',
  'filterPriority',
  'filterContext',
  'filtersExpanded',
  'viewMode',
  'sortBy',
  'sortDirection',
  'focusModeEnabled',
  'momentumModeEnabled',
  'momentumEnergy',
  'momentumRunActive',
  'keystoneTaskId',
  'customContexts',
  'theme',
] as const;

type SettingKey = typeof SETTING_KEYS[number];

interface ExportPayload {
  version: number;
  exportedAt: string;
  settings: Record<string, unknown>;
  tasks: Task[];
}

interface ImportOptions {
  replace?: boolean;
}

export async function exportTasks(): Promise<void> {
  const tasks = await getAllTasks();

  const settings: Record<string, unknown> = {};
  await Promise.all(
    SETTING_KEYS.map(async (key) => {
      settings[key] = await getSetting(key, null);
    })
  );

  const payload: ExportPayload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    settings,
    tasks,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tasks-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importTasks(
  file: File,
  { replace = false }: ImportOptions = {}
): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const raw = e.target?.result;
        if (typeof raw !== 'string') throw new Error('Failed to read file contents.');

        const parsed: unknown = JSON.parse(raw);

        const isExportPayload = (v: unknown): v is ExportPayload =>
          typeof v === 'object' && v !== null && 'tasks' in v;

        const incoming = Array.isArray(parsed)
          ? parsed
          : isExportPayload(parsed)
          ? parsed.tasks
          : null;

        if (!Array.isArray(incoming)) {
          throw new Error(
            'Invalid file format. Expected an array of tasks or an export file from this app.'
          );
        }

        if (replace) {
          const existing = await getAllTasks();
          await Promise.all(existing.map((t) => deleteTask(t.id)));
        }

        const normalized: Task[] = incoming.map((task: Partial<Task>, index: number) => ({
          id: task.id ?? crypto.randomUUID(),
          title: task.title ?? 'Untitled task',
          load: task.load ?? 'medium',
          priority: task.priority ?? 'medium',
          context: task.context ?? 'general',
          done: task.done ?? false,
          position: task.position ?? index,
          createdAt: task.createdAt ?? Date.now(),
          snoozedUntil: task.snoozedUntil ?? null,
        }));

        await Promise.all(normalized.map((t) => saveTask(t)));

        if (isExportPayload(parsed) && parsed.settings) {
          const { customContexts, ...otherSettings } = parsed.settings;

          await Promise.all(
            Object.entries(otherSettings).map(([key, value]) => {
              if (value !== null && (SETTING_KEYS as readonly string[]).includes(key)) {
                return saveSetting(key as SettingKey, value);
              }
            })
          );

          if (Array.isArray(customContexts)) {
            await saveCustomContexts(customContexts as string[]);
          }
        }

        resolve(normalized);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsText(file);
  });
}