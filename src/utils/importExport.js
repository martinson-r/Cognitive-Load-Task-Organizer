import { getAllTasks, saveTask, deleteTask, getSetting, saveSetting, saveCustomContexts } from "../data/db";

const SETTING_KEYS = [
  "advancedFeaturesEnabled",
  "showSnoozedTasks",
  "showCompleted",
  "filterLoad",
  "filterPriority",
  "filterContext",
  "filtersExpanded",
  "viewMode",
  "sortBy",
  "sortDirection",
  "focusModeEnabled",
  "momentumModeEnabled",
  "momentumEnergy",
  "momentumRunActive",
  "keystoneTaskId",
  "customContexts",
];

/**
 * Exports all tasks and settings to a JSON file and triggers a browser download.
 */
export async function exportTasks() {
  const tasks = await getAllTasks();

  const settings = {};
  await Promise.all(
    SETTING_KEYS.map(async (key) => {
      settings[key] = await getSetting(key, null);
    })
  );

  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    settings,
    tasks,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports tasks (and settings if present) from a JSON file.
 *
 * @param {File} file - The file selected by the user.
 * @param {{ replace: boolean }} options
 *   replace: true  → wipes existing tasks first (full replace)
 *   replace: false → upserts imported tasks alongside existing ones (default)
 * @returns {Promise<object[]>} The normalized tasks that were saved.
 */
export async function importTasks(file, { replace = false } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);

        const incoming = Array.isArray(parsed) ? parsed : parsed?.tasks;

        if (!Array.isArray(incoming)) {
          throw new Error(
            "Invalid file format. Expected an array of tasks or an export file from this app."
          );
        }

        if (replace) {
          const existing = await getAllTasks();
          await Promise.all(existing.map((t) => deleteTask(t.id)));
        }

        const normalized = incoming.map((task, index) => ({
          id: task.id ?? crypto.randomUUID(),
          title: task.title ?? "Untitled task",
          load: task.load ?? "medium",
          priority: task.priority ?? "medium",
          context: task.context ?? "general",
          done: task.done ?? false,
          position: task.position ?? index,
          createdAt: task.createdAt ?? Date.now(),
          snoozedUntil: task.snoozedUntil ?? null,
        }));

        await Promise.all(normalized.map((t) => saveTask(t)));

        if (parsed?.settings && !Array.isArray(parsed)) {
          const { customContexts, ...otherSettings } = parsed.settings;

          await Promise.all(
            Object.entries(otherSettings).map(([key, value]) => {
              if (value !== null && SETTING_KEYS.includes(key)) {
                return saveSetting(key, value);
              }
            })
          );

          if (Array.isArray(customContexts)) {
            await saveCustomContexts(customContexts);
          }
        }

        resolve(normalized);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsText(file);
  });
}