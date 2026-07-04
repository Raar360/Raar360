import Dexie, { type EntityTable } from "dexie";

export interface ProgressRecord {
  bookId: string;
  pageIndex: number;
  completed: boolean;
  updatedAt: number;
}

export interface SettingsRecord {
  key: string;
  value: unknown;
}

export interface OverrideRecord {
  id: string;
  bookId: string;
  file: "story" | "coach" | "activity" | "meta";
  json: object;
  updatedAt: number;
}

class PipsBackpackDB extends Dexie {
  progress!: EntityTable<ProgressRecord, "bookId">;
  settings!: EntityTable<SettingsRecord, "key">;
  overrides!: EntityTable<OverrideRecord, "id">;

  constructor() {
    super("pips-backpack");
    this.version(1).stores({
      progress: "bookId",
      settings: "key",
      overrides: "id, bookId, file",
    });
  }
}

export const db = new PipsBackpackDB();
