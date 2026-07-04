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
