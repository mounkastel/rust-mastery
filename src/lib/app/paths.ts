/**
 * Every URL in the app is relative to the deploy base. Content stores paths
 * relative to that base (`book-html/ch03-01.html`), so one helper is the only
 * place the base appears. Nothing else may hardcode `/rust-mastery/`.
 */
const base: string = import.meta.env.BASE_URL;

export function withBase(path: string): string {
  return `${base}${path.replace(/^\//, '')}`;
}

/** Content may point at a vendored file or at an external doc page. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

/**
 * A content href resolved against the vendored tree it belongs to. An absolute
 * URL is returned untouched: prefixing `book-html/` onto one produced a link to
 * a file that cannot exist.
 */
export function resourceHref(tree: string, href: string): string {
  return isExternal(href) ? href : `${tree}/${href}`;
}
