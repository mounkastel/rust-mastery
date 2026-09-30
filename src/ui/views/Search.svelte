<script lang="ts">
  import { concepts, type Concept } from '../../content';
  import type { CourseStore } from '../../lib/app/store.svelte';
  import { lessonHref } from '../../lib/app/router';
  import { lockState, type LockState } from '../../lib/domain/curriculum';

  interface Props {
    store: CourseStore;
    query: string;
  }
  const { store, query }: Props = $props();

  interface Hit {
    concept: Concept;
    field: string;
    excerpt: string;
  }

  interface Group {
    concept: Concept;
    hits: Hit[];
  }

  const LOCK_WORD: Record<LockState, string> = {
    locked: 'Locked',
    available: 'Not started',
    started: 'In progress',
    revisit: 'Retake due',
    passed: 'Passed',
  };

  /** Where in a lesson a query can match, and how to read the text out. */
  const HAYSTACKS: { field: string; read: (c: Concept) => string[] }[] = [
    { field: 'Title', read: (c) => [c.title] },
    { field: 'Question', read: (c) => c.questions.map((q) => q.prompt) },
    { field: 'Answer', read: (c) => c.questions.map((q) => q.explain) },
    { field: 'Drill', read: (c) => c.drills.map((d) => d.name.replace(/_/g, ' ')) },
    { field: 'Example', read: (c) => c.examples.map((e) => e.title) },
  ];

  const MAX_HITS = 80;
  const CONTEXT_BEFORE = 40;
  const CONTEXT_AFTER = 60;

  const needle = $derived(query.trim().toLowerCase());

  const groups = $derived.by((): Group[] => {
    if (needle.length < 2) return [];
    const out: Group[] = [];
    const index: Record<string, Group> = {};
    let found = 0;
    for (const concept of concepts) {
      for (const { field, read } of HAYSTACKS) {
        for (const text of read(concept)) {
          if (found >= MAX_HITS) return out;
          const at = text.toLowerCase().indexOf(needle);
          if (at === -1) continue;
          found += 1;
          const hit: Hit = { concept, field, excerpt: excerptAround(text, at, needle.length) };
          const group = index[concept.id];
          if (group === undefined) {
            const fresh: Group = { concept, hits: [hit] };
            index[concept.id] = fresh;
            out.push(fresh);
          } else {
            group.hits.push(hit);
          }
        }
      }
    }
    return out;
  });

  const hitCount = $derived(groups.reduce((sum, group) => sum + group.hits.length, 0));

  /** One hit per matching text, with a little context on either side. */
  function excerptAround(text: string, at: number, length: number): string {
    const flat = text.replace(/\s+/g, ' ');
    const from = Math.max(0, at - CONTEXT_BEFORE);
    const to = Math.min(flat.length, at + length + CONTEXT_AFTER);
    return `${from > 0 ? '…' : ''}${flat.slice(from, to).trim()}${to < flat.length ? '…' : ''}`;
  }

  function oninput(event: Event): void {
    const value = (event.currentTarget as HTMLInputElement).value;
    location.hash = `#/search?q=${encodeURIComponent(value)}`;
  }
</script>

<svelte:head><title>Search · Rust Mastery</title></svelte:head>

<h1>Search</h1>

<div class="search" role="search">
  <label for="q">Search lessons, questions and answers</label>
  <input
    id="q"
    type="search"
    value={query}
    placeholder="borrow checker, Option, dyn…"
    {oninput}
    autocomplete="off"
  />
</div>

{#if needle.length < 2}
  <p class="hint">Type at least two characters.</p>
{:else if groups.length === 0}
  <p class="hint">Nothing matches “{query}”.</p>
{:else}
  <p class="hint" role="status">
    {hitCount}
    {hitCount === 1 ? 'match' : 'matches'} in {groups.length}
    {groups.length === 1 ? 'lesson' : 'lessons'}
  </p>
  {#each groups as group (group.concept.id)}
    {@const lock = lockState(store.progress, group.concept)}
    <section class="group">
      <h2>
        <a href={lessonHref(group.concept.id)}>{group.concept.title}</a>
        <span class="lock">{LOCK_WORD[lock]}</span>
      </h2>
      <ul>
        {#each group.hits as hit (hit.field + hit.excerpt)}
          <li><span class="field">{hit.field}</span>{hit.excerpt}</li>
        {/each}
      </ul>
    </section>
  {/each}
  {#if hitCount >= MAX_HITS}
    <p class="hint">Showing the first {MAX_HITS} matches. Narrow the search to see more.</p>
  {/if}
{/if}

<style>
  h1 {
    margin-block-end: var(--space-4);
  }
  /* A div with role="search" rather than a form: there is nothing to submit,
     the query lives in the URL so a search can be shared and reloaded. */
  .search {
    display: grid;
    gap: var(--space-2);
    max-inline-size: 32rem;
    margin-block-end: var(--space-4);
  }
  .search label {
    color: var(--text-muted);
    font-size: var(--step--1);
  }
  .search input {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--edge-strong);
    border-radius: var(--radius-2);
    background: var(--bg-raised);
  }
  .hint {
    color: var(--text-muted);
    font-size: var(--step--1);
  }
  .group {
    margin-block: var(--space-4);
  }
  .group h2 {
    display: flex;
    gap: var(--space-2);
    align-items: baseline;
    margin-block-end: var(--space-1);
    font-size: var(--step-1);
  }
  .lock {
    color: var(--text-faint);
    font-size: var(--step--1);
    font-weight: 400;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    display: grid;
    grid-template-columns: 5rem 1fr;
    gap: var(--space-3);
    padding-block: var(--space-1);
    color: var(--text-muted);
    font-size: var(--step--1);
    overflow-wrap: anywhere;
  }
  .field {
    color: var(--text-faint);
    font-family: var(--mono);
    font-size: var(--step--1);
  }
</style>
