import { z } from "zod";

export const WonderQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  pipPrompt: z.string().optional(),
});

export const CoachSchema = z.object({
  version: z.literal(1),
  bookId: z.string(),
  wonder: z.object({
    intro: z.string().optional(),
    questions: z.array(WonderQuestionSchema).min(1),
  }),
  pocket: z.object({
    reflection: z.string().min(1),
    pipLine: z.string().optional(),
  }),
});

export type WonderQuestion = z.infer<typeof WonderQuestionSchema>;
export type Coach = z.infer<typeof CoachSchema>;
