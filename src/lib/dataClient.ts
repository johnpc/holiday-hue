/**
 * Shared Amplify Data client. Every model is household-only (`editors` group),
 * so ALL reads and writes go through userPool — the group claim rides the JWT.
 * There is no guest path by design (this app controls a real house).
 */
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

export const dataClient = generateClient<Schema>({ authMode: 'userPool' });

/**
 * Unwrap an Amplify result, THROWING when it carries GraphQL errors. Amplify
 * resolves (never rejects) on a failed request with `{ data: null, errors }`,
 * so without this a transient auth/network failure reads as "empty".
 */
export function unwrap<T>(result: { data: T; errors?: readonly { message: string }[] }): T {
  if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join('; '));
  return result.data;
}

export type LightRecord = Schema['Light']['type'];
export type RunnerStatusRecord = Schema['RunnerStatus']['type'];
