import { z } from "zod";

export const PipExpression = z.enum(["neutral", "curious", "excited", "gentle"]);

export const StoryPageSchema = z.object({
  id: z.string(),
  illustration: z.string(),
  text: z.string().min(1),
  narration: z.string().optional(),
  pipExpression: PipExpression.optional(),
});

export const StoryTransition = z.enum(["fade", "slide", "gentle-zoom"]);

export const StorySchema = z.object({
  version: z.literal(1),
  bookId: z.string(),
  pages: z.array(StoryPageSchema).min(1),
  transition: StoryTransition.default("fade"),
});

export type PipExpression = z.infer<typeof PipExpression>;
export type StoryPage = z.infer<typeof StoryPageSchema>;
export type StoryTransition = z.infer<typeof StoryTransition>;
export type Story = z.infer<typeof StorySchema>;
