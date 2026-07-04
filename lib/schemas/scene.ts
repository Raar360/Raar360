import { z } from "zod";
import { AssetRefSchema, PositionSchema } from "./asset";

/** How dialogue is presented for this scene (text lives in story.json). */
export const DialogueMode = z.enum(["narration", "speech", "mixed", "none"]);

/** Future animation hook — story content stays unchanged when animation is added. */
export const SceneAnimationSchema = z.object({
  id: z.string(),
  /** Animation preset (e.g. "float", "walk-in", "sparkle"). Resolved by Scene Engine. */
  preset: z.string().optional(),
  /** Target layer id within the scene. */
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

/** Character layer — references a character asset with pose, expression, and position. */
export const SceneCharacterSchema = z.object({
  id: z.string(),
  character: z.string(),
  pose: z.string(),
  expression: z.string().optional(),
  position: PositionSchema,
  transform: SceneTransformSchema.optional(),
  animation: SceneAnimationSchema.optional(),
});

/** Generic placed asset (props, objects, effects, speech bubbles). */
export const SceneLayerSchema = z.object({
  id: z.string(),
  asset: AssetRefSchema,
  position: PositionSchema,
  transform: SceneTransformSchema.optional(),
  /** Text content for speech-bubble assets (optional — caption may use story text). */
  text: z.string().optional(),
  animation: SceneAnimationSchema.optional(),
});

/** A composable scene — one per story page. References reusable Asset Library entries. */
export const SceneSchema = z.object({
  id: z.string(),
  background: AssetRefSchema,
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
