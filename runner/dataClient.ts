import { readFileSync } from 'node:fs';
import { Amplify } from 'aws-amplify';
import { signIn, signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

export type RunnerData = ReturnType<typeof generateClient<Schema>>;

/** Configure Amplify from the outputs file and sign in as the runner's
 * household (editors) account. All calls go through userPool. */
export async function connect(
  outputsPath: string,
  username: string,
  password: string,
): Promise<RunnerData> {
  Amplify.configure(JSON.parse(readFileSync(outputsPath, 'utf8')));
  await signOut().catch(() => {});
  await signIn({ username, password });
  return generateClient<Schema>({ authMode: 'userPool' });
}
