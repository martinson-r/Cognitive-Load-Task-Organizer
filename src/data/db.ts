import { openDB, IDBPDatabase } from 'idb';
import { Task } from '../types';

const DB_NAME = 'cognitive-load-db';
const TASK_STORE = 'tasks';
const SETTINGS_STORE = 'appSettings';

interface SettingsRecord {
  id: string;
  value: unknown;
}

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(TASK_STORE)) {
        db.createObjectStore(TASK_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
      }
    },
  });
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll(TASK_STORE);
}

export async function saveTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put(TASK_STORE, task);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(TASK_STORE, id);
}

export async function getSetting<T>(id: string, fallback: T): Promise<T> {
  const db = await getDB();
  const record = await db.get(SETTINGS_STORE, id) as SettingsRecord | undefined;
  return (record?.value ?? fallback) as T;
}

export async function saveSetting(id: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put(SETTINGS_STORE, { id, value });
}

export async function getCustomContexts(): Promise<string[]> {
  return getSetting<string[]>('customContexts', []);
}

export async function saveCustomContexts(values: string[]): Promise<void> {
  return saveSetting('customContexts', values);
}