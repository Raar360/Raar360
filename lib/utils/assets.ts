import type { AssetEntry } from "@/types";

/** Resolve a library asset path to a public URL. */
export function getLibraryAssetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
  return `/assets/${clean}`;
}

/** Legacy book-scoped illustration URL (migration fallback). */
export function getIllustrationUrl(bookId: string, relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
  return `/stories/${bookId}/${clean}`;
}

export function getAssetUrl(entry: AssetEntry): string | null {
  if (entry.path) return getLibraryAssetUrl(entry.path);
  return null;
}
