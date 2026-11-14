import type { LightFrame } from '../src/domain/frame';
import type { SceneState } from '../src/domain/scene';
import { MS_PER_COMMAND, type Plan, planTick } from './animator';
import type { HueClient } from './hueClient';
import type { LightInventory } from './inventory';

/** The plan's delay is the whole tick budget; the paced sends already used part of it. */
const remainingBudget = (plan: Plan) =>
  Math.max(0, plan.nextDelayMs - plan.commands.length * MS_PER_COMMAND);

/** Send each light write MS_PER_COMMAND apart (the bridge 429s on bursts);
 * returns the first failure's reason, or null when every write landed. */
async function sendPaced(commands: Plan['commands'], deps: LoopDeps): Promise<string | null> {
  let firstError: string | null = null;
  for (const [i, { hueId, cmd }] of commands.entries()) {
    if (i > 0) await deps.sleep(MS_PER_COMMAND);
    await deps.hue.setLight(hueId, cmd).catch((err: Error) => {
      firstError ??= String(err);
    });
  }
  return firstError;
}

interface LoopDeps {
  hue: HueClient;
  rng: () => number;
  setTimeout: (fn: () => void, ms: number) => ReturnType<typeof globalThis.setTimeout>;
  clearTimeout: (t: ReturnType<typeof globalThis.setTimeout>) => void;
  /** Pause between light writes so a tick never bursts past the bridge limit. */
  sleep: (ms: number) => Promise<void>;
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
    lastError = await sendPaced(plan.commands, deps);
    if (lastError) deps.log(`tick: light writes failed: ${lastError}`);
    return remainingBudget(plan);
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
