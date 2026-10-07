export function setServerIslandCache(
  locals: App.Locals,
  ttlSeconds: number,
  isAvailable: boolean,
): void {
  locals.serverIslandCache = { ttlSeconds, isAvailable };
}
