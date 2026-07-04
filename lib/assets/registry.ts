import fs from "fs/promises";
import path from "path";
import { AssetRegistrySchema } from "@/lib/schemas/registry";
import type { AssetRegistry, AssetRegistryEntry } from "@/types";
import { computeAssetUsageCounts } from "./usage";

const REGISTRY_PATH = path.join(process.cwd(), "assets", "registry.json");

let cachedRegistry: AssetRegistry | null = null;

export async function loadAssetRegistry(): Promise<AssetRegistry> {
  if (cachedRegistry) return cachedRegistry;

  const raw = await fs.readFile(REGISTRY_PATH, "utf-8");
  const parsed = AssetRegistrySchema.parse(JSON.parse(raw));
  const usageCounts = await computeAssetUsageCounts();

  cachedRegistry = {
    ...parsed,
    assets: parsed.assets.map((asset) => ({
      ...asset,
      usageCount: usageCounts.get(asset.id) ?? 0,
    })),
  };

  return cachedRegistry;
}

export function getRegistryAsset(registry: AssetRegistry, id: string): AssetRegistryEntry | undefined {
  return registry.assets.find((asset) => asset.id === id);
}

export function getRegistryAssetsByCategory(
  registry: AssetRegistry,
  category: AssetRegistryEntry["category"],
): AssetRegistryEntry[] {
  return registry.assets.filter((asset) => asset.category === category);
}

export function clearAssetRegistryCache(): void {
  cachedRegistry = null;
}

/** @deprecated Use loadAssetRegistry */
export const loadAssetManifest = loadAssetRegistry;
