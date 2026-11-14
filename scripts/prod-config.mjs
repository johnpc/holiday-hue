/**
 * Pull amplify_outputs.json from the deployed `main` backend (Amplify Hosting
 * app), waiting out an in-progress deployment — `ampx generate outputs` hard-
 * fails with DeploymentInProgressError mid-deploy, which is a transient race.
 * APP_ID is filled in once the Amplify Hosting app exists (see CLAUDE.md).
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const APP_ID = process.env.AMPLIFY_APP_ID ?? 'REPLACE_WITH_AMPLIFY_APP_ID';
const BRANCH = 'main';
const PROFILE = 'personal';
const ARGS = [
  'ampx',
  'generate',
  'outputs',
  '--app-id',
  APP_ID,
  '--branch',
  BRANCH,
  '--profile',
  PROFILE,
];
const MAX_ATTEMPTS = 40;
const DELAY_MS = 30_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const inProgress = (s) =>
  s.includes('DeploymentInProgressError') || s.includes('deployment is in progress');

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    const { stdout } = await run('npx', ARGS, { encoding: 'utf8' });
    process.stdout.write(stdout);
    break;
  } catch (err) {
    const out = `${err.stdout ?? ''}${err.stderr ?? ''}`;
    if (!inProgress(out) || attempt === MAX_ATTEMPTS) {
      process.stderr.write(out);
      throw err;
    }
    console.log(
      `Deploy in progress — retry ${attempt}/${MAX_ATTEMPTS - 1} in ${DELAY_MS / 1000}s…`,
    );
    await sleep(DELAY_MS);
  }
}
