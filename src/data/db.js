import { openDB } from "idb";

const DB_NAME = "cognitive-load-db";
const TASK_STORE = "tasks";
const SETTINGS_STORE = "appSettings";

export async function getDB() {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(TASK_STORE)) {
        db.createObjectStore(TASK_STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "id" });
      }
    },
  });
}

export async function getAllTasks() {
  const db = await getDB();
  return db.getAll(TASK_STORE);
}

export async function saveTask(task) {
  const db = await getDB();
  return db.put(TASK_STORE, task);
}

export async function deleteTask(id) {
  const db = await getDB();
  return db.delete(TASK_STORE, id);
}

export async function getCustomContexts() {
  const db = await getDB();
  const record = await db.get(SETTINGS_STORE, "customContexts");
  return record?.values ?? [];
}

export async function saveCustomContexts(values) {
  const db = await getDB();
  return db.put(SETTINGS_STORE, {
    id: "customContexts",
    values,
  });
}