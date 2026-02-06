import type { DBSchema, IDBPDatabase } from "idb";

type HubDB = DBSchema & {
  kv: {
    key: string;
    value: unknown;
  };
};

const DB_NAME = "afroxhub-storage";
const STORE_NAME = "kv";

let dbPromise: Promise<IDBPDatabase<HubDB>> | null = null;

function hasIndexedDB() {
  return typeof indexedDB !== "undefined";
}

async function getDB(): Promise<IDBPDatabase<HubDB>> {
  if (!hasIndexedDB()) {
    throw new Error("IndexedDB unavailable in this environment");
  }
  if (!dbPromise) {
    dbPromise = import("idb").then(({ openDB }) =>
      openDB<HubDB>(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        },
      }),
    );
  }
  return dbPromise;
}

export async function getItem<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const value = await db.get(STORE_NAME, key);
  return (value as T | null) ?? null;
}

export async function setItem<T>(key: string, value: T) {
  const db = await getDB();
  await db.put(STORE_NAME, value, key);
}

export async function removeItem(key: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, key);
}

export async function clearStore() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
