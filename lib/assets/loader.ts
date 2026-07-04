import fs from "fs/promises";
import path from "path";
import { AssetManifestSchema } from "@/lib/schemas/asset";
import type { AssetEntry, AssetManifest } from "@/types";

const MANIFEST_PATH = path.join(process.cwd(), "assets", "manifest.json");

let cachedManifest: AssetManifest | null = null;

export async function loadAssetManifest(): Promise<AssetManifest> {
  if (cachedManifest) return cachedManifest;

  const raw = await fs.readFile(MANIFEST_PATH, "utf-8");
  cachedManifest = AssetManifestSchema.parse(JSON.parse(raw));
  return cachedManifest;
}

export function getAssetById(manifest: AssetManifest, id: string): AssetEntry | undefined {
  return manifest.assets.find((asset) => asset.id === id);
}

export function getAssetsByCategory(
  manifest: AssetManifest,
  category: AssetEntry["category"],
): AssetEntry[] {
  return manifest.assets.filter((asset) => asset.category === category);
}

/** Clear cached manifest (useful in tests). */
export function clearAssetManifestCache(): void {
  cachedManifest = null;
}
