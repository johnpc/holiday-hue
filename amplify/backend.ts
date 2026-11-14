import { defineBackend } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * Holiday Hue backend: Cognito (household auth) + AppSync/DynamoDB holding the
 * desired light scene, the bridge's light inventory, and the runner heartbeat.
 * No Lambdas — the always-on runner lives on the umbrel box (see runner/).
 */
const backend = defineBackend({ auth, data });

// Long-lived sessions: a household app must not log people out monthly. Refresh
// token at Cognito's 10-year max; access/ID tokens ride it and stay at 1 day.
const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.refreshTokenValidity = Duration.days(3650).toDays();
cfnUserPoolClient.accessTokenValidity = Duration.days(1).toHours();
cfnUserPoolClient.idTokenValidity = Duration.days(1).toHours();
cfnUserPoolClient.tokenValidityUnits = {
  refreshToken: 'days',
  accessToken: 'hours',
  idToken: 'hours',
};
