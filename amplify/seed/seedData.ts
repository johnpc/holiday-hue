import { DEFAULT_SCENE } from '../../src/domain/scene';
import { toSceneRow } from '../../src/domain/sceneRow';
import { LIGHTS, STALE_HEARTBEAT } from './fixtures/lights';
import { clearOneModel, client } from './seedClient';

/** Wipe every model so the seed converges to the same state on re-run. */
export async function clearAll(): Promise<void> {
  await clearOneModel(client.models.Scene as never);
  await clearOneModel(client.models.Light as never);
  await clearOneModel(client.models.RunnerStatus as never);
}

function assertOk<T>(result: { data: T; errors?: readonly { message: string }[] }): T {
  if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join('; '));
  return result.data;
}

/** The default scene (id 'main'), the fake inventory, and a stale heartbeat. */
export async function seedAll(now: Date): Promise<void> {
  assertOk(await client.models.Scene.create({ id: 'main', ...toSceneRow(DEFAULT_SCENE) }));
  for (const light of LIGHTS) {
    assertOk(
      await client.models.Light.create({
        ...light,
        reachable: true,
        lastSeenAt: now.toISOString(),
      }),
    );
  }
  assertOk(
    await client.models.RunnerStatus.create({
      id: 'main',
      lastHeartbeatAt: STALE_HEARTBEAT,
      bridgeReachable: false,
      lightCount: LIGHTS.length,
      message: 'seeded',
      version: 'seed',
    }),
  );
}
