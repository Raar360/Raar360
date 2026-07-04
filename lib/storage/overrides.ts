import { db, type OverrideRecord } from "./db";

function overrideId(bookId: string, file: OverrideRecord["file"]): string {
  return `${bookId}:${file}`;
}

export async function getOverride(
  bookId: string,
  file: OverrideRecord["file"],
): Promise<object | null> {
  const record = await db.overrides.get(overrideId(bookId, file));
  return record?.json ?? null;
}

export async function setOverride(
  bookId: string,
  file: OverrideRecord["file"],
  json: object,
): Promise<void> {
  await db.overrides.put({
    id: overrideId(bookId, file),
    bookId,
    file,
    json,
    updatedAt: Date.now(),
  });
}

export async function getBookOverrides(bookId: string): Promise<Partial<Record<OverrideRecord["file"], object>>> {
  const records = await db.overrides.where("bookId").equals(bookId).toArray();
  return records.reduce<Partial<Record<OverrideRecord["file"], object>>>((acc, record) => {
    acc[record.file] = record.json;
    return acc;
  }, {});
}
