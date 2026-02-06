import * as indexed from "./indexed";
import * as local from "./local";

export const hybridStorage = {
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await indexed.getItem<T>(key);
      if (value !== null && value !== undefined) return value;
    } catch {
      /* falls through */
    }
    return local.getJSON<T>(key);
  },

  async setJSON<T>(key: string, value: T) {
    try {
      await indexed.setItem<T>(key, value);
    } catch {
      local.setJSON<T>(key, value);
    }
  },

  async remove(key: string) {
    try {
      await indexed.removeItem(key);
    } catch {
      local.remove(key);
    }
  },
};
