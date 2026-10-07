export function setServerIslandCache(
  headers: Headers,
  ttlSeconds: number,
  isAvailable: boolean,
): void {
  headers.set(
    "Cache-Control",
    isAvailable ? `public, max-age=0, s-maxage=${ttlSeconds}` : "no-store",
  );
}
