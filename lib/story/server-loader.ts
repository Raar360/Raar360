import fs from "fs/promises";
import path from "path";
import {
  ActivitySchema,
  BookMetaSchema,
  CoachSchema,
  LibrarySchema,
  StorySchema,
} from "@/lib/schemas";
import type { Activity, BookMeta, Coach, Library, Story } from "@/types";

const STORIES_DIR = path.join(process.cwd(), "stories");

export interface BookBundle {
  meta: BookMeta;
  story: Story;
  coach: Coach;
  activity: Activity;
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as unknown;
}

export async function loadLibraryFromDisk(): Promise<Library> {
  const data = await readJsonFile(path.join(STORIES_DIR, "library.json"));
  return LibrarySchema.parse(data);
}

export async function loadBookFromDisk(bookId: string): Promise<BookBundle> {
  const bookDir = path.join(STORIES_DIR, bookId);

  const [meta, story, coach, activity] = await Promise.all([
    readJsonFile(path.join(bookDir, "meta.json")),
    readJsonFile(path.join(bookDir, "story.json")),
    readJsonFile(path.join(bookDir, "coach.json")),
    readJsonFile(path.join(bookDir, "activity.json")),
  ]);

  return {
    meta: BookMetaSchema.parse(meta),
    story: StorySchema.parse(story),
    coach: CoachSchema.parse(coach),
    activity: ActivitySchema.parse(activity),
  };
}

export async function listBookIds(): Promise<string[]> {
  const library = await loadLibraryFromDisk();
  return library.books.filter((book) => book.enabled).map((book) => book.id);
}
