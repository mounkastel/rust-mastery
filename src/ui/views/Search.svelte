<script lang="ts">
  import { concepts, type Concept } from '../../content';
  import type { CourseStore } from '../../lib/app/store.svelte';
  import { lessonHref } from '../../lib/app/router';
  import { lockState } from '../../lib/domain/curriculum';

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

  const HAYSTACKS: { field: string; read: (c: Concept) => string[] }[] = [
    { field: 'Title', read: (c) => [c.title] },
    { field: 'Question', read: (c) => c.questions.map((q) => q.prompt) },
    { field: 'Answer', read: (c) => c.questions.map((q) => q.explain) },
    { field: 'Drill', read: (c) => c.drills.map((d) => d.name.replace(/_/g, ' ')) },
    { field: 'Example', read: (c) => c.examples.map((e) => e.title) },
  ];

  const needle = $derived(query.trim().toLowerCase());

  const hits = $derived.by((): Hit[] => {
    if (needle.length < 2) return [];
    const out: Hit[] = [];
    for (const concept of concepts) {
      for (const { field, read } of HAYSTACKS) {
        for (const text of read(concept)) {
          const at = text.toLowerCase().indexOf(needle);
          if (at === -1) continue;
          const from = Math.max(0, at - 40);
          out.push({
            concept,
            field,
            excerpt: `${from > 0 ? '…' : ''}${text
              .slice(from, at + needle.length + 60)
              .replace(/\s+/g, ' ')
              .trim()}…`,
          });
        }
      }
    }
    return out.slice(0, 80);
  });

  /** Hits grouped by lesson, in the order the first hit of each appeared. */
  const grouped = $derived.by((): [string, Hit[]][] => {
    const out: [string, Hit[]][] = [];
    const index: Record<string, Hit[]> = {};
    for (const hit of hits) {
      const existing = index[hit.concept.id];
      if (existing === undefined) {
        const list = [hit];
        index[hit.concept.id] = list;
        out.push([hit.concept.id, list]);
      } else {
        existing.push(hit);
      }
    }
    return out;
  });
</script>

<svelte:head><title>Search · Rust Mastery</title></svelte:head>

<h1>Search</h1>

<form
  class="search"
  role="search"
  onsubmit={(e) => {
    e.preventDefault();
  }}
>
  <label for="q">Search lessons, questions and answers</label>
  <input id="q" type="search" name="q" value={query} placeholder="borrow checker, Option, dyn…" />
</form>

{#if needle.length < 2}
  <p class="hint">Type at least two characters.</p>
{:else if grouped.length === 0}
  <p class="hint">Nothing matches “{query}”.</p>
{:else}
  <p class="hint" role="status">
    {hits.length}
    {hits.length === 1 ? 'match' : 'matches'} in {grouped.length} lessons
  </p>
  {#each grouped as [id, list] (id)}
    {@const concept = list[0]?.concept}
    {#if concept !== undefined}
      <section class="group">
        <h2>
          <a href={lessonHref(id)}>{concept.title}</a>
          <span class="lock" data-lock={lockState(store.progress, concept)}>
            {lockState(store.progress, concept)}
          </span>
        </h2>
        <ul>
          {#each list as hit (hit.field + hit.excerpt)}
            <li><span class="field">{hit.field}</span>{hit.excerpt}</li>
          {/each}
        </ul>
      </section>
    {/if}
  {/each}
{/if}

<style>
  h1 {
    margin-block-end: var(--space-4);
  }
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
