export interface TimerDeps {
  setTimeout: (fn: () => void, ms: number) => ReturnType<typeof globalThis.setTimeout>;
  clearTimeout: (t: ReturnType<typeof globalThis.setTimeout>) => void;
}

/**
 * Single-flight scheduler: runs `work` (which returns the delay until the next
 * run) and never overlaps two runs. `kick()` asks for an immediate run — now if
 * idle, or right after the in-flight run finishes.
 */
export class Scheduler {
  private timer: ReturnType<typeof globalThis.setTimeout> | null = null;
  private running = false;
  private busy = false;
  private kicked = false;

  constructor(
    private readonly deps: TimerDeps,
    private readonly work: () => Promise<number>,
  ) {}

  start = (): void => {
    this.running = true;
    this.schedule(0);
  };

  stop = (): void => {
    this.running = false;
    if (this.timer) this.deps.clearTimeout(this.timer);
  };

  kick = (): void => {
    if (!this.running) return;
    if (this.busy) this.kicked = true;
    else this.schedule(0);
  };

  private schedule(ms: number): void {
    if (!this.running) return;
    if (this.timer) this.deps.clearTimeout(this.timer);
    this.timer = this.deps.setTimeout(() => void this.cycle(), ms);
  }

  private async cycle(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    const delay = await this.work().finally(() => {
      this.busy = false;
    });
    this.schedule(this.kicked ? 0 : delay);
    this.kicked = false;
  }
}
