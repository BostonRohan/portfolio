// Used only by the named diagnostic preview branch to isolate Sentry startup cost.
export function captureException() {}
export function captureMessage() {}
export async function flush() {
  return true;
}
