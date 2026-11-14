#!/usr/bin/env node
/**
 * Deterministic Halstead-difficulty gate (port of jpc.finance.native's
 * check_halstead.py to TypeScript sources).
 *
 *   D = (n1 / 2) * (N2 / n2)
 *   n1 = distinct operators, n2 = distinct operands, N2 = total operands
 *
 * computed per function body from a token stream. High D = dense expressions a
 * reader must juggle at once — the complement to the line gate (length) and
 * CRAP (branchiness × coverage). Fails if any function exceeds MAX_DIFFICULTY.
 * Fix by naming intermediates or extracting sub-expressions, never by raising
 * the threshold. Test files + declarative amplify files are exempt.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const MAX_DIFFICULTY = 20;
const ROOTS = ['src', 'amplify', 'runner'];
const SKIP_DIRS = new Set(['node_modules', '.amplify', 'dist', 'build', 'fixtures']);
const isExempt = (rel) =>
  /\.test\.tsx?$/.test(rel) ||
  rel.endsWith('.d.ts') ||
  rel === 'amplify/backend.ts' ||
  /^amplify\/.*resource\.ts$/.test(rel);

const KEYWORD_OPERATORS = new Set([
  'if',
  'else',
  'switch',
  'case',
  'default',
  'for',
  'while',
  'do',
  'return',
  'throw',
  'try',
  'catch',
  'finally',
  'await',
  'async',
  'break',
  'continue',
  'in',
  'of',
  'as',
  'instanceof',
  'typeof',
  'new',
  'delete',
  'void',
  'yield',
  'null',
  'undefined',
]);
const DECL_KEYWORDS = new Set([
  'function',
  'const',
  'let',
  'var',
  'class',
  'interface',
  'type',
  'enum',
  'import',
  'export',
  'from',
  'extends',
  'implements',
  'public',
  'private',
  'protected',
  'readonly',
  'static',
  'this',
  'super',
  'get',
  'set',
  'declare',
  'namespace',
  'keyof',
  'satisfies',
  'string',
  'number',
  'boolean',
  'never',
  'object',
  'symbol',
  'bigint',
]);
const SYMBOL_OPERATOR_RE =
  /^(?:=>|\.\.\.|\?\.|\?\?=?|&&=?|\|\|=?|===|!==|==|!=|<=|>=|\+\+|--|\*\*=?|\+=|-=|\*=|\/=|%=|<<|>>>?|[-+*/%<>=!&|^~?:])$/;
const TOKEN_RE =
  /`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d[\d_]*(?:\.\d+)?n?\b|\b\w+\b|=>|\.\.\.|\?\.|\?\?=?|&&=?|\|\|=?|===|!==|==|!=|<=|>=|\+\+|--|\*\*=?|\+=|-=|\*=|\/=|%=|<<|>>>?|[-+*/%<>=!&|^~?:.]/g;
// `function name(`, `name(...) {` methods, and `name = (...) =>` / `name = async (` arrows.
const FUNC_RE =
  /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s*(\w+)|^\s*(?:export\s+)?(?:const|let)\s+(\w+)\s*(?::[^=]+)?=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*(?::\s*[^=]+?)?\s*=>|^\s*(?:public|private|protected|static|async|readonly|\s)*\s*(\w+)\s*\([^)]*\)\s*(?::\s*[\w<>[\]|, ]+)?\s*\{\s*$/;
const NOT_FUNCS = new Set([
  'function',
  'if',
  'for',
  'while',
  'switch',
  'catch',
  'constructor',
  'return',
]);

const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

/** Yield { name, line, body } using brace matching from each function start line. */
function* functionBodies(text) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = FUNC_RE.exec(lines[i]);
    if (!m) continue;
    const name = m[1] ?? m[2] ?? m[3];
    if (!name || NOT_FUNCS.has(name)) continue;
    let depth = 0;
    let started = false;
    const body = [];
    for (let j = i; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === '{') {
          depth += 1;
          started = true;
        } else if (ch === '}') depth -= 1;
      }
      body.push(lines[j]);
      if (started && depth <= 0) break;
      if (!started && j > i + 2) break; // arrow with expression body — no braces
    }
    yield { name, line: i + 1, body: body.join('\n') };
  }
}

function difficulty(body) {
  const operators = new Map();
  const operands = new Map();
  for (const tok of stripComments(body).match(TOKEN_RE) ?? []) {
    if (DECL_KEYWORDS.has(tok) || tok === '.') continue;
    const bucket =
      KEYWORD_OPERATORS.has(tok) || SYMBOL_OPERATOR_RE.test(tok) ? operators : operands;
    bucket.set(tok, (bucket.get(tok) ?? 0) + 1);
  }
  const n1 = operators.size;
  const n2 = operands.size;
  const N2 = [...operands.values()].reduce((a, b) => a + b, 0);
  return n2 === 0 ? 0 : (n1 / 2) * (N2 / n2);
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(entry)) yield full;
  }
}

const results = [];
for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  for (const file of walk(root)) {
    const rel = relative(process.cwd(), file).split('\\').join('/');
    if (isExempt(rel)) continue;
    for (const fn of functionBodies(readFileSync(file, 'utf8'))) {
      results.push({ file: rel, ...fn, d: difficulty(fn.body) });
    }
  }
}
results.sort((a, b) => b.d - a.d);
console.log('Top 5 Halstead difficulty:');
for (const r of results.slice(0, 5))
  console.log(`  ${r.file}:${r.line} ${r.name}  D=${r.d.toFixed(1)}`);
const failures = results.filter((r) => r.d > MAX_DIFFICULTY);
if (failures.length) {
  console.error(`\n✖ ${failures.length} function(s) exceed Halstead difficulty ${MAX_DIFFICULTY}:`);
  for (const r of failures) console.error(`    ${r.file}:${r.line} ${r.name}  D=${r.d.toFixed(1)}`);
  console.error('\n  Dense expressions: name intermediate values or extract sub-expressions.\n');
  process.exit(1);
}
console.log(`\n✓ All ${results.length} functions ≤ D ${MAX_DIFFICULTY}.`);
