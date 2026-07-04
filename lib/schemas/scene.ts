import { z } from "zod";
import { PositionSchema } from "./asset";

/** How dialogue is presented for this scene (text lives in story.json). */
export const DialogueMode = z.enum(["narration", "speech", "mixed", "none"]);

/** Future animation hook — story content stays unchanged when animation is added. */
export const SceneAnimationSchema = z.object({
  id: z.string(),
  preset: z.string().optional(),
  target: z.string().optional(),
  delay: z.number().nonnegative().optional(),
  duration: z.number().positive().optional(),
  loop: z.boolean().optional(),
});

export const SceneTransformSchema = z.object({
  scale: z.number().positive().optional(),
  rotation: z.number().optional(),
  flipX: z.boolean().optional(),
  zIndex: z.number().int().optional(),
});

/** Character layer — references a character asset ID with pose, expression, and position. */
export const SceneCharacterSchema = z.object({
  id: z.string(),
  character: z.string(),
  pose: z.string(),
  expression: z.string().optional(),
  position: PositionSchema,
  transform: SceneTransformSchema.optional(),
  animation: SceneAnimationSchema.optional(),
});

/** Generic placed asset layer — references registry asset by ID only. */
export const SceneLayerSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  position: PositionSchema,
  transform: SceneTransformSchema.optional(),
  text: z.string().optional(),
  animation: SceneAnimationSchema.optional(),
});

/** A composable scene — references Asset Registry IDs, never file paths. */
export const SceneSchema = z.object({
  id: z.string(),
  /** Asset Registry ID for the background. */
  background: z.string(),
  characters: z.array(SceneCharacterSchema).default([]),
  props: z.array(SceneLayerSchema).default([]),
  objects: z.array(SceneLayerSchema).default([]),
  speechBubbles: z.array(SceneLayerSchema).default([]),
  effects: z.array(SceneLayerSchema).default([]),
  dialogue: DialogueMode.default("narration"),
  animation: SceneAnimationSchema.optional(),
});

export type DialogueMode = z.infer<typeof DialogueMode>;
export type SceneAnimation = z.infer<typeof SceneAnimationSchema>;
export type SceneTransform = z.infer<typeof SceneTransformSchema>;
export type SceneCharacter = z.infer<typeof SceneCharacterSchema>;
export type SceneLayer = z.infer<typeof SceneLayerSchema>;
export type Scene = z.infer<typeof SceneSchema>;
