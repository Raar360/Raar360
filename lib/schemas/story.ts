import { z } from "zod";
import { SceneSchema } from "./scene";

export const PipExpression = z.enum(["neutral", "curious", "excited", "gentle"]);

export const StoryPageSchema = z
  .object({
    id: z.string(),
    /** Composable scene referencing Asset Library entries. */
    scene: SceneSchema.optional(),
    text: z.string().min(1),
    narration: z.string().optional(),
    /** Legacy flat illustration — kept for migration fallback only. */
    illustration: z.string().optional(),
    /** Legacy Pip overlay — prefer scene character expression. */
    pipExpression: PipExpression.optional(),
  })
  .refine((page) => page.scene || page.illustration, {
    message: "Story page must define either scene or illustration",
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
