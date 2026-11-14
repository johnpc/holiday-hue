import { useLights, useRunnerStatus } from './lightsApi';
import { groupRooms, runnerOnline } from './rooms';

/** Settings card: the runner heartbeat, bridge reachability, and inventory. */
export function RunnerStatusCard({ now = Date.now }: { now?: () => number }) {
  const { data: status } = useRunnerStatus();
  const { data: lights = [] } = useLights();
  const online = runnerOnline(status?.lastHeartbeatAt, now());
  const rooms = groupRooms(lights);
  return (
    <section className="hh-card runner-card" data-testid="runner-card">
      <p className="hh-kicker">Runner</p>
      <p className="runner-card__state" data-testid="runner-card-state">
        {online ? 'Online' : 'Offline'}
        {status?.lastHeartbeatAt && (
          <span className="hh-muted">
            {' '}
            · last seen {new Date(status.lastHeartbeatAt).toLocaleString()}
          </span>
        )}
      </p>
      <p className="hh-muted">
        Bridge {status?.bridgeReachable ? 'reachable' : 'not reachable'} · {lights.length} lights in{' '}
        {rooms.length} rooms{status?.version ? ` · v${status.version}` : ''}
      </p>
      {status?.message && (
        <p className="runner-card__msg" data-testid="runner-card-message">
          {status.message}
        </p>
      )}
      {!online && (
        <p className="hh-muted">
          The runner is the small program on your home server that drives the bulbs. If it stays
          offline, restart the <code>holiday-hue-runner</code> container.
        </p>
      )}
    </section>
  );
}
