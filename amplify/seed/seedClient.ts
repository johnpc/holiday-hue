/** Shared Amplify client + helpers for the seed runner. */
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Schema } from '../data/resource';

const here = dirname(fileURLToPath(import.meta.url));
const outputs = JSON.parse(readFileSync(resolve(here, '../../amplify_outputs.json'), 'utf8'));

Amplify.configure(outputs);
// Every model is household-only, so the seed signs in as an editor and ALL
// calls (list/create/delete) go through userPool.
export const client = generateClient<Schema>({ authMode: 'userPool' });

// Load TEST_USERNAME/TEST_PASSWORD from .env.local if not already in the env.
const envLocal = resolve(here, '../../.env.local');
if (existsSync(envLocal)) {
  for (const line of readFileSync(envLocal, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

/** Minimal shape of an Amplify model needed to wipe it generically. */
interface ClearableModel {
  list: (opts: {
    limit: number;
    nextToken?: string;
  }) => Promise<{ data: ({ id: string } | null)[]; nextToken?: string | null }>;
  delete: (id: { id: string }) => Promise<{ data: { id: string } | null }>;
}

/** Delete every row of one model, paginating through ALL pages. */
export async function clearOneModel(model: ClearableModel): Promise<number> {
  let removed = 0;
  let token: string | undefined;
  do {
    const { data, nextToken } = await model.list({ limit: 1000, nextToken: token });
    const rows = data.filter((row): row is { id: string } => !!row?.id);
    await Promise.all(rows.map((row) => model.delete({ id: row.id })));
    removed += rows.length;
    token = nextToken ?? undefined;
  } while (token);
  return removed;
}
