/**
 * Hash routing. GitHub Pages serves `dist/` with no rewrite rule, so a
 * path-based route 404s on a hard refresh of a deep link. A fragment survives
 * the refresh and needs no 404 fallback.
 *
 * Routes: #/ (dashboard), #/course, #/lesson/<id>, #/review, #/search?q=...
 */
import { conceptById } from '../../content';

export type Route =
  | { name: 'dashboard' }
  | { name: 'course' }
  | { name: 'lesson'; id: string }
  | { name: 'review' }
  | { name: 'search'; query: string };

export function parse(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '');
  const [path = '', search = ''] = raw.split('?');
  const parts = path.split('/').filter((p) => p !== '');
  if (parts[0] === 'lesson' && parts[1] !== undefined && conceptById.has(parts[1])) {
    return { name: 'lesson', id: parts[1] };
  }
  if (parts[0] === 'review') return { name: 'review' };
  if (parts[0] === 'search') {
    return { name: 'search', query: new URLSearchParams(search).get('q') ?? '' };
  }
  if (parts[0] === 'course') return { name: 'course' };
  return { name: 'dashboard' };
}

export const lessonHref = (id: string): string => `#/lesson/${id}`;
