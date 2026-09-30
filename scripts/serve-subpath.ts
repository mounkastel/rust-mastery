#!/usr/bin/env node
/**
 * Serves dist/ at http://127.0.0.1:<port>/rust-mastery/ so the built site can
 * be checked under the exact prefix GitHub Pages uses. A plain static server
 * rooted at dist/ would resolve every asset at the domain root and hide the
 * subpath bugs this is here to catch.
 *
 *   node scripts/serve-subpath.ts [--port 4173] [--dir dist]
 */
import { createReadStream } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const PREFIX = '/rust-mastery/';
const args: string[] = process.argv.slice(2);

/** Value of `--name`, or the fallback when the flag is absent. */
function flag(name: string, fallback: string): string {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? fallback : (args[at + 1] ?? fallback);
}

const port = Number(flag('port', '4173'));
const root = resolve(flag('dir', 'dist'));

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.rs': 'text/plain; charset=utf-8',
  '.toml': 'text/plain; charset=utf-8',
};

function fail(res: ServerResponse, status: number, message: string): void {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(message);
}

/** Maps a request path to a file, refusing anything that escapes `root`. */
async function resolveFile(pathname: string): Promise<string | null> {
  const rel = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, '');
  const candidate = resolve(join(root, rel));
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  try {
    const info = await stat(candidate);
    return info.isDirectory() ? await resolveFile(join(pathname, 'index.html')) : candidate;
  } catch {
    return null;
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');

  if (url.pathname === '/' || url.pathname === PREFIX.slice(0, -1)) {
    res.writeHead(302, { location: PREFIX });
    res.end();
    return;
  }
  if (!url.pathname.startsWith(PREFIX)) {
    fail(res, 404, `This server only serves ${PREFIX}\n`);
    return;
  }

  void resolveFile(url.pathname.slice(PREFIX.length)).then((file) => {
    if (file === null) {
      fail(res, 404, `Not found: ${url.pathname}\n`);
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`serving ${root} at http://127.0.0.1:${port}${PREFIX}`);
});
