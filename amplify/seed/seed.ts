/**
 * Idempotent seed runner: signs in as the household editor, clears every model,
 * then writes the default scene + a fake light inventory + a stale heartbeat.
 *
 *   npm run e2e-config   # ensure amplify_outputs.json exists
 *   npm run seed         # needs TEST_USERNAME / TEST_PASSWORD in .env.local
 */
import { signIn, signOut } from 'aws-amplify/auth';
import './seedClient';
import { clearAll, seedAll } from './seedData';

async function main() {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;
  if (!username || !password) throw new Error('TEST_USERNAME / TEST_PASSWORD required to seed.');
  await signOut().catch(() => {});
  await signIn({ username, password });
  await clearAll();
  console.log('Cleared all models.');
  await seedAll(new Date());
  await signOut().catch(() => {});
  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
