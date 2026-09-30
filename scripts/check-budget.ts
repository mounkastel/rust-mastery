#!/usr/bin/env node
/**
 * Fails the build if the app shell grows past the budget in the README.
 * Covers only what the bundler emits: the vendored trees in public/ are copied
 * verbatim and are separately checksummed, and most of the app's own weight is
 * curriculum text, which is why the number is generous.
 *
 *   node scripts/check-budget.ts
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = resolve(import.meta.dirname, '..', 'dist', 'assets');
/** gzip bytes. See the "Bundle budget" section of README.md. */
const BUDGET = 120 * 1024;

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

await stat(DIST).catch(() => {
  console.error('dist/assets is missing; run `npm run build` first');
  process.exit(1);
});

let total = 0;
for (const file of (await walk(DIST)).sort()) {
  if (!/\.(js|css)$/.test(file)) continue;
  const gz = gzipSync(await readFile(file)).length;
  total += gz;
  const name = file.slice(DIST.length + 1);
  console.log(`  ${(gz / 1024).toFixed(1).padStart(6)} kB  ${name}`);
}

const used = ((total / BUDGET) * 100).toFixed(0);
console.log(
  `\ntotal ${(total / 1024).toFixed(1)} kB gzip of a ${BUDGET / 1024} kB budget (${used}%)`,
);

if (total > BUDGET) {
  console.error(`\nover budget by ${((total - BUDGET) / 1024).toFixed(1)} kB`);
  process.exit(1);
}
