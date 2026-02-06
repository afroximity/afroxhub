const isBrowser = typeof window !== "undefined";

export function isLocalStorageAvailable() {
  try {
    if (!isBrowser || !window.localStorage) return false;
    const key = "__afroxhub_test__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function getJSON<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJSON<T>(key: string, value: T) {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* swallow */
  }
}

export function remove(key: string) {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* swallow */
  }
}
