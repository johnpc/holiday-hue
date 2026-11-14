import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Holiday Hue data schema.
 *
 * Three tiny models, all HOUSEHOLD-ONLY (`editors` group, userPool auth): this
 * app controls the lights in a real house, so there is deliberately no guest
 * grant and no plain-authenticated grant — a client/schema provider mismatch
 * returns empty/Unauthorized, never data.
 *
 * - Scene        the ONE desired state (id 'main'): theme, pattern, speed,
 *                brightness, on/off, target. The phone writes it; the umbrel
 *                runner subscribes and animates the bridge.
 * - Light        inventory the runner discovers on the Hue bridge (CLIP v2) and
 *                mirrors here so the app can list lights/rooms without reaching
 *                the LAN.
 * - RunnerStatus heartbeat (id 'main') so the app can say online/offline.
 */
// Shared household rule, inlined per model (resource.ts is declarative).
const HOUSEHOLD_OPS = ['read', 'create', 'update', 'delete'] as const;

const schema = a.schema({
  Scene: a
    .model({
      powerOn: a.boolean().required(),
      themeId: a.string().required(),
      patternId: a.string().required(),
      speed: a.integer().required(), // 1 (slow) … 10 (fast)
      brightness: a.integer().required(), // 1 … 100
      customColor: a.string(), // #rrggbb, used by the "solid" theme
      target: a.string().required(), // 'all' or a Hue room/zone id
    })
    .authorization((allow) => [allow.group('editors').to([...HOUSEHOLD_OPS])]),

  Light: a
    .model({
      hueId: a.string().required(),
      name: a.string().required(),
      roomId: a.string(),
      roomName: a.string(),
      reachable: a.boolean().required(),
      supportsColor: a.boolean().required(),
      lastSeenAt: a.datetime().required(),
    })
    .secondaryIndexes((index) => [index('hueId')])
    .authorization((allow) => [allow.group('editors').to([...HOUSEHOLD_OPS])]),

  RunnerStatus: a
    .model({
      lastHeartbeatAt: a.datetime().required(),
      bridgeReachable: a.boolean().required(),
      lightCount: a.integer().required(),
      message: a.string(),
      version: a.string(),
    })
    .authorization((allow) => [allow.group('editors').to([...HOUSEHOLD_OPS])]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
