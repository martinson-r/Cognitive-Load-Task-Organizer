import { openDB } from "idb";

const DB_NAME = "cognitive-load-db";
const STORE_NAME = "tasks";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function getAllTasks() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function saveTask(task) {
  const db = await getDB();
  return db.put(STORE_NAME, task);
}

export async function deleteTask(id) {
  const db = await getDB();
  return db.delete(STORE_NAME, id);
}