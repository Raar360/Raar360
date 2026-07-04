import type { Activity, BookMeta, Coach, Library, Story } from "@/types";
import { getBookOverrides } from "@/lib/storage/overrides";

export interface BookBundle {
  meta: BookMeta;
  story: Story;
  coach: Coach;
  activity: Activity;
}

function mergeOverride<T extends object>(base: T, override: object | null | undefined): T {
  if (!override) return base;
  return { ...base, ...override } as T;
}

export async function fetchLibrary(): Promise<Library> {
  const res = await fetch("/api/library");
  if (!res.ok) throw new Error("Failed to load library");
  return res.json() as Promise<Library>;
}

export async function fetchBook(bookId: string): Promise<BookBundle> {
  const res = await fetch(`/api/stories/${bookId}`);
  if (!res.ok) throw new Error(`Failed to load book: ${bookId}`);
  const base = (await res.json()) as BookBundle;

  const overrides = await getBookOverrides(bookId);

  return {
    meta: mergeOverride(base.meta, overrides.meta),
    story: mergeOverride(base.story, overrides.story),
    coach: mergeOverride(base.coach, overrides.coach),
    activity: mergeOverride(base.activity, overrides.activity),
  };
}

export { fetchBook as loadBook };
