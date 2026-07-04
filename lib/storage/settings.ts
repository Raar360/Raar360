import { db } from "./db";

export async function getSetting<T>(key: string): Promise<T | null> {
  const record = await db.settings.get(key);
  return (record?.value as T) ?? null;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}
