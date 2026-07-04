import { z } from "zod";

const ActivityBase = z.object({
  version: z.literal(1),
  bookId: z.string(),
  title: z.string(),
  instructions: z.string(),
});

export const TapExploreActivitySchema = ActivityBase.extend({
  type: z.literal("tap-explore"),
  hotspots: z.array(
    z.object({
      id: z.string(),
      label: z.string().optional(),
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
      revealText: z.string(),
      revealIllustration: z.string().optional(),
    }),
  ),
  background: z.string(),
});

export const DragExploreActivitySchema = ActivityBase.extend({
  type: z.literal("drag-explore"),
  items: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      illustration: z.string().optional(),
    }),
  ),
  zones: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      acceptAll: z.boolean().default(true),
      responseText: z.string(),
    }),
  ),
  background: z.string(),
});

export const DrawSpaceActivitySchema = ActivityBase.extend({
  type: z.literal("draw-space"),
  prompt: z.string(),
  background: z.string().optional(),
});

export const ActivitySchema = z.discriminatedUnion("type", [
  TapExploreActivitySchema,
  DragExploreActivitySchema,
  DrawSpaceActivitySchema,
]);

export type Activity = z.infer<typeof ActivitySchema>;
export type TapExploreActivity = z.infer<typeof TapExploreActivitySchema>;
