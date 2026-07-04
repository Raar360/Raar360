import { getLibraryAssetUrl } from "@/lib/utils/assets";
import type { AssetRegistryEntry } from "@/types";

export function getRegistryAssetUrl(entry: AssetRegistryEntry): string | null {
  if (!entry.filePath) return null;
  return getLibraryAssetUrl(entry.filePath);
}
