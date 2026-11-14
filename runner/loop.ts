import type { LightFrame } from '../src/domain/frame';
import type { SceneState } from '../src/domain/scene';
import { planTick } from './animator';
import type { HueClient } from './hueClient';
import type { LightInventory } from './inventory';

/** The first rejection's reason, or null when every write landed. */
function firstFailure(results: PromiseSettledResult<void>[]): string | null {
  const failed = results.find((r) => r.status === 'rejected');
  return failed ? String((failed as PromiseRejectedResult).reason) : null;
}

interface LoopDeps {
  hue: HueClient;
  rng: () => number;
  setTimeout: (fn: () => void, ms: number) => ReturnType<typeof globalThis.setTimeout>;
  clearTimeout: (t: ReturnType<typeof globalThis.setTimeout>) => void;
  log: (msg: string) => void;
}

/**
 * The animation loop: one tick plans the frame for the current scene, sends
 * only the changed lights to the bridge, then schedules the next tick at the
 * pace the plan asks for. Scene/light changes take effect on the next tick;
 * a scene change forces a full resend (prev frame is cleared).
 */
export function createLoop(deps: LoopDeps) {
  let scene: SceneState | null = null;
  let lights: LightInventory[] = [];
  let prev = new Map<string, LightFrame | 'off'>();
  let tick = 0;
  let timer: ReturnType<typeof globalThis.setTimeout> | null = null;
  let running = false;
  let lastError: string | null = null;

  async function runTick(): Promise<number> {
    if (!scene) return 1000;
    const plan = planTick({ scene, lights, tick, rng: deps.rng, prev });
    tick += 1;
    prev = plan.frame;
    const results = await Promise.allSettled(
      plan.commands.map(({ hueId, cmd }) => deps.hue.setLight(hueId, cmd)),
    );
    lastError = firstFailure(results);
    if (lastError) deps.log(`tick: light writes failed: ${lastError}`);
    return plan.nextDelayMs;
  }

  function schedule(ms: number) {
    if (!running) return;
    timer = deps.setTimeout(() => {
      void runTick().then(schedule);
    }, ms);
  }

  return {
    setScene(next: SceneState) {
      scene = next;
      prev = new Map(); // full resend so the new look lands immediately
      tick = 0;
      if (running && timer) {
        deps.clearTimeout(timer);
        schedule(0);
      }
    },
    setLights(next: LightInventory[]) {
      lights = next;
    },
    start() {
      running = true;
      schedule(0);
    },
    stop() {
      running = false;
      if (timer) deps.clearTimeout(timer);
    },
    runTick,
    lastError: () => lastError,
  };
}
