import { db } from "@/lib/storage/db";

export interface Progress {
  bookId: string;
  pageIndex: number;
  completed: boolean;
  updatedAt: number;
}

export async function getProgress(bookId: string): Promise<Progress | null> {
  const record = await db.progress.get(bookId);
  return record ?? null;
}

export async function getAllProgress(): Promise<Progress[]> {
  return db.progress.toArray();
}

export async function saveProgress(bookId: string, pageIndex: number): Promise<void> {
  await db.progress.put({
    bookId,
    pageIndex,
    completed: false,
    updatedAt: Date.now(),
  });
}

export async function markCompleted(bookId: string): Promise<void> {
  const existing = await db.progress.get(bookId);
  await db.progress.put({
    bookId,
    pageIndex: existing?.pageIndex ?? 0,
    completed: true,
    updatedAt: Date.now(),
  });
}

export async function getResumePage(bookId: string, totalPages: number): Promise<number> {
  const progress = await getProgress(bookId);
  if (!progress) return 0;
  return Math.min(Math.max(progress.pageIndex, 0), totalPages - 1);
}

export function getProgressLabel(progress: Progress | undefined): string | null {
  if (!progress) return null;
  if (progress.completed) return "Finished";
  if (progress.pageIndex > 0) return "Continue";
  return null;
}
