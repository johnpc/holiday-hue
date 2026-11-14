import { useLights, useRunnerStatus } from './lightsApi';
import { runnerOnline } from './rooms';

/** Header chip: is the umbrel runner alive, and how many lights does it see. */
export function StatusChip({ now = Date.now }: { now?: () => number }) {
  const status = useRunnerStatus();
  const lights = useLights();
  const online = runnerOnline(status.data?.lastHeartbeatAt, now());
  const count = lights.data?.length ?? 0;
  return (
    <span
      slot="end"
      className={`status-chip${online ? ' status-chip--online' : ''}`}
      data-testid="runner-status"
      data-online={online}
    >
      <span className="status-chip__dot" aria-hidden />
      {online ? `Online · ${count} lights` : 'Runner offline'}
    </span>
  );
}
