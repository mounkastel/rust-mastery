/**
 * The curriculum stores prompt and explanation text as plain strings with a
 * small, load-bearing markup convention:
 *
 *   `code`            an inline code span
 *   ```fenced```      a code block
 *   a blank line      a paragraph boundary
 *   `Output:`         a paragraph-final marker; everything after it is stdout
 *   ->                (U+2192) a causal step, rendered as a numbered list
 *
 * This module turns a string into a list of renderable segments. The UI layer
 * decides how to style them; nothing here touches the DOM.
 */

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'output'; value: string[] }
  | { kind: 'checklist'; value: string[] };

const FENCE = /```(\w*)\n?([\s\S]*?)```/g;
const OUTPUT_MARKER = /(^|[\s.!?;:"'([{\]])Output:(?=\s)/;

/** Rust-shaped lines: two or more lines with at least one strong marker. */
const CODE_MARKER =
  /(;\s*$|{\s*$|}\s*;?\s*$|^\s*(fn|let|mut|use|struct|enum|impl|for|while|loop|if|match|return|println!|print!|eprint!|assert!|const|static|pub|mod|trait|where)\b|::|->|=>)/;

export function looksLikeCode(paragraph: string): boolean {
  const lines = paragraph.split('\n').filter((l) => l.trim() !== '');
  if (lines.length < 2) return false;
  return lines.some((l) => CODE_MARKER.test(l));
}

/** Splits at the `Output:` marker. Prose keeps any punctuation before it. */
function splitOutput(paragraph: string): { before: string; stdout: string[] } | null {
  const match = OUTPUT_MARKER.exec(paragraph);
  if (match === null) return null;
  // Group 1 is a non-capturing-safe leading character the regex consumed; it is
  // dropped from the output but counted in the cut so any punctuation before
  // `Output:` stays with the prose.
  const cut = match.index + (match[1] ?? '').length;
  const stdout = paragraph
    .slice(cut + 'Output:'.length)
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '');
  if (stdout.length === 0) return null;
  return { before: paragraph.slice(0, cut).trimEnd(), stdout };
}

/** A numbered checklist item: `1. [ ] text` or a bare bullet. */
const CHECKLIST_ITEM = /^(?:\d+\.\s*)?\[[ xX]\]\s*(.+)$/;

function splitChecklist(text: string): Segment | null {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '');
  if (lines.length === 0 || !lines.every((l) => CHECKLIST_ITEM.test(l))) return null;
  return {
    kind: 'checklist',
    value: lines.map((l) => (CHECKLIST_ITEM.exec(l) as RegExpExecArray)[1] as string),
  };
}

export function segments(text: string): Segment[] {
  const raw = text;
  const chunks: { type: 'text' | 'code'; value: string }[] = [];
  let cursor = 0;
  FENCE.lastIndex = 0;
  let match = FENCE.exec(raw);
  while (match !== null) {
    if (match.index > cursor) chunks.push({ type: 'text', value: raw.slice(cursor, match.index) });
    chunks.push({ type: 'code', value: (match[2] ?? '').replace(/\n$/, '') });
    cursor = match.index + match[0].length;
    match = FENCE.exec(raw);
  }
  if (cursor < raw.length) chunks.push({ type: 'text', value: raw.slice(cursor) });

  const out: Segment[] = [];
  for (const chunk of chunks) {
    if (chunk.type === 'code') {
      if (chunk.value.trim() !== '') out.push({ kind: 'code', value: chunk.value });
      continue;
    }
    for (const paragraph of chunk.value.split(/\n\s*\n/)) {
      if (paragraph.trim() === '') continue;
      const checklist = splitChecklist(paragraph);
      if (checklist !== null) {
        out.push(checklist);
        continue;
      }
      const output = splitOutput(paragraph);
      const head = output === null ? paragraph : output.before;
      if (head.trim() !== '') {
        out.push(
          looksLikeCode(head) ? { kind: 'code', value: head } : { kind: 'text', value: head },
        );
      }
      if (output !== null) out.push({ kind: 'output', value: output.stdout });
    }
  }
  return out;
}

export interface Step {
  cause: string;
  effect: string;
}

/** One arrow per step. A sentence with several `;`-joined arrows fans out. */
export function steps(paragraph: string): Step[] {
  return paragraph
    .split(/\s*;\s*/)
    .filter((part) => part.includes('→'))
    .map((part) => {
      const at = part.indexOf('→');
      return {
        cause: part.slice(0, at).trim(),
        effect: part
          .slice(at + 1)
          .replace(/[.;]+$/, '')
          .trim(),
      };
    });
}

export const hasArrow = (paragraph: string): boolean => paragraph.includes('→');

const SENTENCE = /(?<=[.!?])\s+(?=[A-Z0-9"'`({[])/;

/** Prose and step runs, in order, so a paragraph reads top to bottom. */
export function prose(paragraph: string): { prose: string[]; runs: Step[][] } {
  const proseOut: string[] = [];
  const runs: Step[][] = [];
  let pending: Step[] = [];
  const flush = (): void => {
    if (pending.length > 0) runs.push(pending);
    pending = [];
  };
  for (const sentence of paragraph.split(SENTENCE)) {
    if (hasArrow(sentence)) {
      pending.push(...steps(sentence));
    } else {
      flush();
      proseOut.push(sentence);
    }
  }
  flush();
  return { prose: proseOut, runs };
}
