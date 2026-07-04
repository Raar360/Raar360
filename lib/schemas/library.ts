import { z } from "zod";

export const StoryObjectType = z.enum([
  "green-brick",
  "radio",
  "wall",
  "volcano",
  "backpack",
  "treasure-map",
  "battery",
  "puzzle-piece",
  "compass",
]);

export const LibraryBookEntrySchema = z.object({
  id: z.string().regex(/^book\d+$/),
  object: StoryObjectType,
  title: z.string().min(1),
  subtitle: z.string().optional(),
  sortOrder: z.number().int().nonnegative(),
  enabled: z.boolean().default(true),
});

export const LibrarySchema = z.object({
  version: z.literal(1),
  books: z.array(LibraryBookEntrySchema),
});

export type StoryObjectType = z.infer<typeof StoryObjectType>;
export type LibraryBookEntry = z.infer<typeof LibraryBookEntrySchema>;
export type Library = z.infer<typeof LibrarySchema>;
