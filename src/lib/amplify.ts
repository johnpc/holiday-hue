/**
 * Configures Amplify (auth + data) from the generated outputs. amplify_outputs.json
 * is gitignored and produced by `npm run e2e-config` / `npm run prod-config`.
 * Import once at startup.
 */
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);
