/** Re-run `fn` until `ok(result)` or attempts run out; returns the last result.
 * Delay is injected so tests stay instant. */
export async function retryUntil<T>(
  fn: () => Promise<T>,
  ok: (value: T) => boolean,
  attempts = 3,
  delayMs = 300,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<T> {
  let result = await fn();
  for (let i = 1; i < attempts && !ok(result); i++) {
    await sleep(delayMs);
    result = await fn();
  }
  return result;
}
