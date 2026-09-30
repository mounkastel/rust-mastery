#!/usr/bin/env node
/**
 * Fails the build if the vendored trees were edited by accident, or if the
 * built site contains a root-absolute URL that would break under the GitHub
 * Pages subpath.
 *
 * Curriculum-to-vendored references are checked in tests/unit/content.test.ts,
 * which already has the curriculum loaded.
 *
 *   node scripts/check-vendored.ts
 */
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PUBLIC = join(ROOT, 'public');
const VENDORED = ['book-html', 'rbe-html', 'rustlings'];
/** The deploy base is the only place the subpath may appear. */
const BASE = '/rust-mastery/';

const problems: string[] = [];

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const expected = new Map<string, string>();
for (const line of (await readFile(join(ROOT, 'scripts/vendored-checksums.txt'), 'utf8'))
  .split('\n')
  .filter((l) => l.trim() !== '')) {
  const [hash = '', path = ''] = line.split(/\s+/);
  expected.set(path, hash);
}

let checked = 0;
for (const tree of VENDORED) {
  for (const file of await walk(join(PUBLIC, tree))) {
    const key = relative(PUBLIC, file);
    const want = expected.get(key);
    if (want === undefined) {
      problems.push(`${key}: not listed in scripts/vendored-checksums.txt`);
      continue;
    }
    const got = createHash('sha256')
      .update(await readFile(file))
      .digest('hex');
    if (got !== want) problems.push(`${key}: sha256 changed (expected ${want}, got ${got})`);
    expected.delete(key);
    checked += 1;
  }
}
for (const key of expected.keys()) {
  problems.push(`${key}: listed in checksums but missing from public/`);
}
console.log(`verified ${checked} vendored files against scripts/vendored-checksums.txt`);

const indexHtml = await readFile(join(ROOT, 'dist/index.html'), 'utf8').catch(() => null);
if (indexHtml === null) {
  problems.push('dist/index.html is missing; run `npm run build` first');
} else {
  for (const match of indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = match[1] ?? '';
    if (!url.startsWith('/') || url.startsWith('//') || url.startsWith(BASE)) continue;
    problems.push(`dist/index.html: root-absolute URL outside the deploy base: ${url}`);
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 40)) console.error(`  ${p}`);
  if (problems.length > 40) console.error(`  ... and ${problems.length - 40} more`);
  process.exit(1);
}
console.log('vendored trees are byte-identical and the build has no root-absolute URLs');
