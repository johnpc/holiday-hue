import { readFileSync } from 'node:fs';
import { Amplify } from 'aws-amplify';
import { signIn, signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

export type RunnerData = ReturnType<typeof generateClient<Schema>>;

/** amplify_outputs.json as a file path, or the JSON itself (env var). */
type OutputsSource = { path: string } | { json: string };

const readOutputs = (src: OutputsSource) =>
  'json' in src ? JSON.parse(src.json) : JSON.parse(readFileSync(src.path, 'utf8'));

/** Configure Amplify from the outputs and sign in as the runner's household
 * (editors) account. All calls go through userPool. */
export async function connect(
  outputs: OutputsSource,
  username: string,
  password: string,
): Promise<RunnerData> {
  Amplify.configure(readOutputs(outputs));
  await signOut().catch(() => {});
  await signIn({ username, password });
  return generateClient<Schema>({ authMode: 'userPool' });
}
