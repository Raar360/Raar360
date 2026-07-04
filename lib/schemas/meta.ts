import { z } from "zod";
import { StoryObjectType } from "./library";

export const BookMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
  object: StoryObjectType,
  characters: z.array(z.enum(["leo", "pip"])).default(["leo", "pip"]),
  ageRange: z
    .object({
      min: z.number().int().min(4).max(12),
      max: z.number().int().min(4).max(12),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type BookMeta = z.infer<typeof BookMetaSchema>;
