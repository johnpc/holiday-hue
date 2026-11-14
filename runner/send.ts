import { MS_PER_COMMAND, type Plan } from './animator';
import type { HueClient, LightCommand } from './hueClient';

export interface SendDeps {
  hue: HueClient;
  /** Pause between light writes so a tick never bursts past the bridge limit. */
  sleep: (ms: number) => Promise<void>;
}

/** A rate-limited write gets one retry after a longer pause. */
const RETRY_AFTER_429_MS = 600;
const isRateLimited = (err: Error) => String(err).includes('HTTP 429');

async function writeOnce(hueId: string, cmd: LightCommand, deps: SendDeps): Promise<string | null> {
  try {
    await deps.hue.setLight(hueId, cmd);
    return null;
  } catch (err) {
    if (!isRateLimited(err as Error)) return String(err);
    await deps.sleep(RETRY_AFTER_429_MS);
    return deps.hue.setLight(hueId, cmd).then(
      () => null,
      (again: Error) => String(again),
    );
  }
}

/** Send each light write MS_PER_COMMAND apart (the bridge 429s on bursts);
 * returns the first failure's reason, or null when every write landed. */
export async function sendPaced(
  commands: Plan['commands'],
  deps: SendDeps,
): Promise<string | null> {
  let firstError: string | null = null;
  for (const [i, { hueId, cmd }] of commands.entries()) {
    if (i > 0) await deps.sleep(MS_PER_COMMAND);
    firstError ??= await writeOnce(hueId, cmd, deps);
  }
  return firstError;
}

/** The plan's delay is the whole tick budget; the paced sends already used part of it. */
export const remainingBudget = (plan: Plan) =>
  Math.max(0, plan.nextDelayMs - plan.commands.length * MS_PER_COMMAND);
