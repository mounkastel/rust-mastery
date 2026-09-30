<script lang="ts">
  import { chapterOf, concepts, type Concept } from '../../content';
  import type { CourseStore } from '../../lib/app/store.svelte';
  import { lessonHref } from '../../lib/app/router';
  import { formatMinutes } from '../../lib/domain/clock';
  import { lockState } from '../../lib/domain/curriculum';
  import Checkpoint from '../blocks/Checkpoint.svelte';
  import ResourceRow from '../blocks/ResourceRow.svelte';

  interface Props {
    store: CourseStore;
    concept: Concept;
  }
  const { store, concept }: Props = $props();

  const chapter = $derived(chapterOf(concept.id));
  const progress = $derived(store.lessonOf(concept.id));
  const lock = $derived(lockState(store.progress, concept));
  const examples = $derived(progress.examples);
  const drills = $derived(progress.drills);
  const practice = $derived(progress.practice);

  const index = $derived(concepts.findIndex((c) => c.id === concept.id));
  const prev = $derived(index > 0 ? (concepts[index - 1] ?? null) : null);
  const next = $derived(index < concepts.length - 1 ? (concepts[index + 1] ?? null) : null);

  const reading = $derived(
    [...concept.reading].sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true })),
  );
  const total = $derived(
    concept.examples.length + concept.drills.length + (concept.practice?.length ?? 0),
  );
  const doneCount = $derived(
    concept.examples.filter((e) => examples[e.href]).length +
      concept.drills.filter((d) => drills[d.name]).length +
      (concept.practice ?? []).filter((t) => practice[t.id]).length,
  );
</script>

<svelte:head><title>{concept.title} · Rust Mastery</title></svelte:head>

<article class="lesson">
  <header class="head">
    <p class="crumb">
      {chapter?.num ?? 'Bonus'} · {chapter?.title ?? ''}
    </p>
    <h1>{concept.title}</h1>
    <p class="meta">
      {formatMinutes(concept.estMinutes)} · difficulty {concept.difficulty} of 4 ·
      {concept.questions.length} questions
    </p>
  </header>

  {#if lock === 'locked'}
    <section class="locked" aria-labelledby="locked-h">
      <h2 id="locked-h">Locked</h2>
      <p>Pass these first:</p>
      <ul>
        {#each concept.prereq as id (id)}
          {@const pre = concepts.find((c) => c.id === id)}
          {#if pre !== undefined}
            {@const done = store.lessonOf(pre.id).passed}
            <li>
              <a href={lessonHref(pre.id)}>{pre.title}</a>
              <span class="pre-state" data-done={done}>{done ? 'passed' : 'not yet'}</span>
            </li>
          {/if}
        {/each}
      </ul>
    </section>
  {:else}
    {#if concept.reading.length > 0}
      <section aria-labelledby="read-h">
        <h2 id="read-h"><span class="verb">Read</span> The book</h2>
        <div class="panel">
          {#each reading as page (page.href)}
            <ResourceRow meta={page.num} label={page.title} href="book-html/{page.href}" />
          {/each}
        </div>
      </section>
    {/if}

    {#if concept.examples.length > 0}
      <section aria-labelledby="see-h">
        <h2 id="see-h"><span class="verb">See</span> Rust by Example</h2>
        <div class="panel">
          {#each concept.examples as example (example.href)}
            <ResourceRow
              label={example.title}
              href="rbe-html/{example.href}"
              note={example.kind === 'exact' ? 'closest match' : 'reinforcement'}
              checked={examples[example.href] === true}
              oncheck={(v: boolean) => {
                store.tick(concept.id, 'examples', example.href, v);
              }}
            />
          {/each}
        </div>
      </section>
    {/if}

    {#if concept.drills.length > 0 || (concept.practice?.length ?? 0) > 0}
      <section aria-labelledby="do-h">
        <h2 id="do-h">
          <span class="verb">Do</span>
          {#if concept.drills.length > 0}Rustlings{:else}On your own{/if}
        </h2>
        <p class="count">{doneCount} of {total} done</p>
        <div class="panel">
          {#each concept.drills as drill (drill.href)}
            <ResourceRow
              meta="code"
              label={drill.name}
              href="rustlings/exercises/{drill.href}"
              note={`rustlings exercise ${drill.href.replace(/\.rs$/, '')}`}
              checked={drills[drill.name] === true}
              oncheck={(v: boolean) => {
                store.tick(concept.id, 'drills', drill.name, v);
              }}
            />
          {/each}
          {#each concept.practice ?? [] as task (task.id)}
            <!-- No href: a DIY task has no page to open. -->
            <ResourceRow
              label={task.text}
              note="write your own"
              checked={practice[task.id] === true}
              oncheck={(v: boolean) => {
                store.tick(concept.id, 'practice', task.id, v);
              }}
            />
          {/each}
        </div>
      </section>
    {/if}

    <section aria-labelledby="prove-h">
      <h2 id="prove-h"><span class="verb">Recall</span> Checkpoint</h2>
      <Checkpoint {store} {concept} />
    </section>

    <nav class="pager" aria-label="Lesson">
      {#if prev !== null}
        <a href={lessonHref(prev.id)} rel="prev">&larr; {prev.title}</a>
      {:else}<span></span>{/if}
      {#if next !== null}
        <a href={lessonHref(next.id)} rel="next">{next.title} &rarr;</a>
      {/if}
    </nav>
  {/if}
</article>

<style>
  .lesson {
    max-inline-size: 52rem;
    min-inline-size: 0;
  }
  .head {
    margin-block-end: var(--space-5);
  }
  .crumb {
    margin: 0;
    color: var(--text-faint);
    font-size: var(--step--1);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  h1 {
    margin-block: var(--space-1) var(--space-2);
  }
  .meta,
  .count {
    margin: 0;
    color: var(--text-muted);
    font-size: var(--step--1);
  }
  .count {
    margin-block-end: var(--space-2);
  }
  section {
    margin-block-end: var(--space-6);
  }
  h2 {
    display: flex;
    gap: var(--space-2);
    align-items: baseline;
    margin-block-end: var(--space-2);
    font-size: var(--step-2);
  }
  .verb {
    padding: 0.1em 0.45em;
    border-radius: var(--radius-1);
    background: var(--accent-quiet);
    color: var(--accent);
    font-size: var(--step--1);
    font-weight: 640;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .panel {
    border: 1px solid var(--edge);
    border-radius: var(--radius-2);
    background: var(--bg-raised);
    padding-inline: var(--space-4);
  }
  .locked {
    padding: var(--space-4);
    border: 1px solid var(--edge);
    border-radius: var(--radius-3);
    background: var(--bg-raised);
  }
  .locked ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .locked li {
    display: flex;
    gap: var(--space-3);
    align-items: baseline;
    padding-block: var(--space-1);
  }
  .pre-state {
    color: var(--text-faint);
    font-size: var(--step--1);
  }
  .pre-state[data-done='true'] {
    color: var(--ok);
  }
  .pager {
    display: flex;
    gap: var(--space-3);
    justify-content: space-between;
    margin-block-start: var(--space-6);
    padding-block-start: var(--space-4);
    border-block-start: 1px solid var(--edge);
  }
  .pager a {
    max-inline-size: 45%;
  }
</style>
