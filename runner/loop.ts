import type { LightFrame } from '../src/domain/frame';
import type { SceneState } from '../src/domain/scene';
import { planTick } from './animator';
import type { LightInventory } from './inventory';
import { Scheduler, type TimerDeps } from './scheduler';
import { remainingBudget, sendPaced, type SendDeps } from './send';

interface LoopDeps extends SendDeps, TimerDeps {
  rng: () => number;
  log: (msg: string) => void;
}

const sameScene = (a: SceneState | null, b: SceneState) =>
  a !== null && JSON.stringify(a) === JSON.stringify(b);

/**
 * The animation loop: one tick plans the frame for the current scene, sends
 * only the changed lights (paced), and the scheduler runs ticks one at a time.
 * A changed scene forces a full resend on an immediate next tick; an identical
 * scene (the 15s poll) is a no-op.
 */
export function createLoop(deps: LoopDeps) {
  let scene: SceneState | null = null;
  let lights: LightInventory[] = [];
  let prev = new Map<string, LightFrame | 'off'>();
  let tick = 0;
  let lastError: string | null = null;

  async function runTick(): Promise<number> {
    if (!scene) return 1000;
    const plan = planTick({ scene, lights, tick, rng: deps.rng, prev });
    tick += 1;
    prev = plan.frame;
    lastError = await sendPaced(plan.commands, deps);
    if (lastError) deps.log(`tick: light writes failed: ${lastError}`);
    return remainingBudget(plan);
  }

  const scheduler = new Scheduler(deps, runTick);

  return {
    setScene(next: SceneState) {
      if (sameScene(scene, next)) return;
      scene = next;
      prev = new Map(); // full resend so the new look lands immediately
      tick = 0;
      scheduler.kick();
    },
    setLights(next: LightInventory[]) {
      lights = next;
    },
    start: scheduler.start,
    stop: scheduler.stop,
    runTick,
    lastError: () => lastError,
  };
}
