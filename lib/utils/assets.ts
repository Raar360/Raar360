export function getIllustrationUrl(bookId: string, relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
  return `/stories/${bookId}/${clean}`;
}
