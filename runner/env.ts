/** Runner configuration, read once from the environment and validated up front. */
interface RunnerEnv {
  username: string;
  password: string;
  bridgeIp: string;
  appKey: string;
  /** Path to amplify_outputs.json — or the JSON itself via AMPLIFY_OUTPUTS_JSON
   * (Dockge's Docker-in-Docker can't bind-mount a single stack file reliably). */
  outputs: { path: string } | { json: string };
  /** Poll interval as a backstop under the live subscription. */
  pollMs: number;
  heartbeatMs: number;
}

const REQUIRED = ['RUNNER_USERNAME', 'RUNNER_PASSWORD', 'HUE_BRIDGE_IP', 'HUE_APP_KEY'] as const;

/** Pure: builds the config or throws naming every missing variable. */
export function parseEnv(env: Record<string, string | undefined>): RunnerEnv {
  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length) throw new Error(`runner: missing env ${missing.join(', ')}`);
  return {
    username: env.RUNNER_USERNAME as string,
    password: env.RUNNER_PASSWORD as string,
    bridgeIp: env.HUE_BRIDGE_IP as string,
    appKey: env.HUE_APP_KEY as string,
    outputs: env.AMPLIFY_OUTPUTS_JSON
      ? { json: env.AMPLIFY_OUTPUTS_JSON }
      : { path: env.AMPLIFY_OUTPUTS ?? 'amplify_outputs.json' },
    pollMs: Number(env.RUNNER_POLL_MS ?? 15_000),
    heartbeatMs: Number(env.RUNNER_HEARTBEAT_MS ?? 30_000),
  };
}
