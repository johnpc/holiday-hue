/**
 * Holiday Hue runner — the always-on process on the umbrel box that turns the
 * desired Scene (written by the phone app) into Hue bridge commands, 24/7.
 *
 *   env: RUNNER_USERNAME / RUNNER_PASSWORD (household Cognito account),
 *        HUE_BRIDGE_IP / HUE_APP_KEY, and the backend outputs as AMPLIFY_OUTPUTS (file path,
 *        default ./amplify_outputs.json) or AMPLIFY_OUTPUTS_JSON (the JSON itself)
 *
 * Wiring only — every decision lives in tested modules (animator, loop, mirror…).
 */
import { parseEnv } from './env';
import { connect } from './dataClient';
import { createHueClient } from './hueClient';
import { nodeTransport } from './https';
import { buildInventory } from './inventory';
import { createLoop } from './loop';
import { mirrorInventory, writeHeartbeat } from './mirror';
import { loadScene, subscribeScene } from './sceneSource';

const VERSION = process.env.RUNNER_VERSION ?? 'dev';
const log = (msg: string) => console.log(`[${new Date().toISOString()}] ${msg}`);

async function main() {
  const env = parseEnv(process.env);
  const data = await connect(env.outputs, env.username, env.password);
  log(`signed in as ${env.username}`);
  const hue = createHueClient(env.bridgeIp, env.appKey, nodeTransport);
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const loop = createLoop({ hue, rng: Math.random, setTimeout, clearTimeout, sleep, log });

  let bridgeReachable = false;
  let lightCount = 0;
  const refreshInventory = async () => {
    try {
      const [lights, rooms] = await Promise.all([hue.listLights(), hue.listRooms()]);
      const inventory = buildInventory(lights, rooms, new Date());
      loop.setLights(inventory);
      await mirrorInventory(data, inventory);
      bridgeReachable = true;
      lightCount = inventory.length;
      log(`inventory: ${inventory.length} lights`);
    } catch (err) {
      bridgeReachable = false;
      log(`inventory failed: ${String(err)}`);
    }
  };
  const refreshScene = async () => {
    try {
      loop.setScene(await loadScene(data));
    } catch (err) {
      log(`scene load failed: ${String(err)}`);
    }
  };
  const heartbeat = () =>
    writeHeartbeat(
      data,
      { bridgeReachable, lightCount, message: loop.lastError(), version: VERSION },
      new Date(),
    ).catch((err) => log(`heartbeat failed: ${String(err)}`));

  await refreshInventory();
  await refreshScene();
  loop.start();
  const unsubscribe = subscribeScene(data, (scene) => {
    log(`scene update: ${scene.themeId}/${scene.patternId} on=${scene.on}`);
    loop.setScene(scene);
  });
  const timers = [
    setInterval(refreshScene, env.pollMs),
    setInterval(refreshInventory, 5 * 60_000),
    setInterval(heartbeat, env.heartbeatMs),
  ];
  await heartbeat();

  const shutdown = () => {
    log('shutting down');
    unsubscribe();
    timers.forEach(clearInterval);
    loop.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
