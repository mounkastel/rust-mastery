/**
 * Every URL in the app is relative to the deploy base. Content stores paths
 * relative to that base (`book-html/ch03-01.html`), so one helper is the only
 * place the base appears. Nothing else may hardcode `/rust-mastery/`.
 */
const base: string = import.meta.env.BASE_URL;

export function withBase(path: string): string {
  return `${base}${path.replace(/^\//, '')}`;
}
