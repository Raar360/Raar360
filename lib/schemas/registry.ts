import { z } from "zod";
import { AssetCategory } from "./asset";

export const AssetDimensionsSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

/** Production asset registry entry — single source of truth for the Asset Library. */
export const AssetRegistryEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: AssetCategory,
  tags: z.array(z.string()).default([]),
  dimensions: AssetDimensionsSchema,
  /** Path relative to `public/assets/`, or null for component-based characters. */
  filePath: z.string().nullable(),
  usageCount: z.number().int().nonnegative().default(0),
  /** React component key for character assets. */
  component: z.enum(["leo", "pip", "dad", "mum", "whiskers"]).optional(),
  poses: z.array(z.string()).optional(),
  expressions: z.array(z.string()).optional(),
});

export const AssetRegistrySchema = z.object({
  version: z.literal(1),
  assets: z.array(AssetRegistryEntrySchema),
});

export type AssetDimensions = z.infer<typeof AssetDimensionsSchema>;
export type AssetRegistryEntry = z.infer<typeof AssetRegistryEntrySchema>;
export type AssetRegistry = z.infer<typeof AssetRegistrySchema>;
