import { z } from "zod";

/** Top-level asset categories in the Asset Library. */
export const AssetCategory = z.enum([
  "character",
  "background",
  "prop",
  "object",
  "speech-bubble",
  "effect",
]);

/** Named horizontal placement presets for scene elements. */
export const ScenePosition = z.enum(["left", "center", "right", "far-left", "far-right"]);

/** Fine-grained placement as percentage of panel width/height. */
export const SceneCoordinates = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export const PositionSchema = z.union([ScenePosition, SceneCoordinates]);

export const AssetRefSchema = z.object({
  id: z.string(),
  category: AssetCategory,
});

/** Variant axes for character assets (pose, expression). */
export const CharacterVariantSchema = z.object({
  pose: z.string(),
  expression: z.string().optional(),
});

/** Single entry in the global Asset Library manifest. */
export const AssetEntrySchema = z.object({
  id: z.string(),
  category: AssetCategory,
  label: z.string(),
  /** Path relative to `/assets/` (e.g. `backgrounds/hallway.svg`). */
  path: z.string().optional(),
  /** For character assets rendered via React components instead of flat SVG. */
  component: z.enum(["leo", "pip", "dad", "mum", "whiskers"]).optional(),
  /** Available poses for this asset (characters) or tags for filtering. */
  poses: z.array(z.string()).optional(),
  expressions: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const AssetManifestSchema = z.object({
  version: z.literal(1),
  assets: z.array(AssetEntrySchema),
});

export type AssetCategory = z.infer<typeof AssetCategory>;
export type ScenePosition = z.infer<typeof ScenePosition>;
export type SceneCoordinates = z.infer<typeof SceneCoordinates>;
export type Position = z.infer<typeof PositionSchema>;
export type AssetRef = z.infer<typeof AssetRefSchema>;
export type CharacterVariant = z.infer<typeof CharacterVariantSchema>;
export type AssetEntry = z.infer<typeof AssetEntrySchema>;
export type AssetManifest = z.infer<typeof AssetManifestSchema>;
