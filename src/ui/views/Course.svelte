<script lang="ts">
  import { curriculum, type Chapter } from '../../content';
  import type { CourseStore } from '../../lib/app/store.svelte';
  import { lessonHref } from '../../lib/app/router';
  import { formatMinutes } from '../../lib/domain/clock';
  import type { LockState } from '../../lib/domain/curriculum';

  interface Props {
    store: CourseStore;
  }
  const { store }: Props = $props();

  interface LessonRow {
    lock: LockState;
    isNext: boolean;
  }

  let collapsed = $state<Record<string, boolean>>({});

  const rows = $derived.by((): Record<string, LessonRow> => {
    const out: Record<string, LessonRow> = {};
    for (const view of store.views()) {
      out[view.concept.id] = { lock: view.lock, isNext: view.isNext };
    }
    return out;
  });

  const groups = $derived(
    curriculum.chapters.map((chapter: Chapter) => ({
      chapter,
      passed: chapter.concepts.filter((c) => store.lessonOf(c.id).passed).length,
    })),
  );

  function isOpen(key: string): boolean {
    return collapsed[key] !== true;
  }
</script>

<svelte:head><title>Course · Rust Mastery</title></svelte:head>

<h1>The sequence</h1>
<p class="intro">
  {curriculum.tagline} Every lesson below is reachable once the ones above it are passed, and each one
  ends in a checkpoint you have to answer correctly.
</p>

<div class="course">
  {#each groups as group (group.chapter.key)}
    {@const done = group.passed === group.chapter.concepts.length}
    <section class="chapter" aria-labelledby="ch-{group.chapter.key}">
      <button
        type="button"
        class="chapter-head"
        aria-expanded={isOpen(group.chapter.key)}
        aria-controls="panel-{group.chapter.key}"
        onclick={() => {
          collapsed = { ...collapsed, [group.chapter.key]: isOpen(group.chapter.key) };
        }}
      >
        <span class="ch-num">{group.chapter.num ?? 'Bonus'}</span>
        <span class="ch-title">
          {group.chapter.title}
          {#if group.chapter.integrative}<span class="ch-tag">project</span>{/if}
        </span>
        <span class="ch-bar" aria-hidden="true">
          <span
            class="ch-bar-fill"
            style="inline-size: {(group.passed / group.chapter.concepts.length) * 100}%"
          ></span>
        </span>
        <span class="ch-count" class:done>{group.passed}/{group.chapter.concepts.length}</span>
      </button>
      <div id="panel-{group.chapter.key}" class="chapter-body" hidden={!isOpen(group.chapter.key)}>
        <ol class="lessons">
          {#each group.chapter.concepts as concept (concept.id)}
            {@const row = rows[concept.id]}
            <li>
              <a
                href={lessonHref(concept.id)}
                class="lesson"
                data-lock={row?.lock ?? 'locked'}
                data-next={row?.isNext ?? false}
              >
                <span class="lesson-title">{concept.title}</span>
                <span class="lesson-meta">{formatMinutes(concept.estMinutes)}</span>
              </a>
            </li>
          {/each}
        </ol>
      </div>
    </section>
  {/each}
</div>

<style>
  h1 {
    margin-block-end: var(--space-2);
  }
  .intro {
    max-inline-size: var(--measure);
    margin-block-end: var(--space-5);
    color: var(--text-muted);
  }
  .course {
    border-block-start: 1px solid var(--edge);
  }
  .chapter {
    border-block-end: 1px solid var(--edge);
  }
  .chapter-head {
    display: grid;
    grid-template-columns: 3.5rem 1fr 6rem 3.5rem;
    gap: var(--space-3);
    align-items: center;
    inline-size: 100%;
    padding: var(--space-3) var(--space-1);
    border: 0;
    background: none;
    text-align: start;
    cursor: pointer;
  }
  .chapter-head:hover {
    background: var(--bg-sunken);
  }
  .ch-num,
  .ch-count {
    color: var(--text-faint);
    font-family: var(--mono);
    font-size: var(--step--1);
    font-variant-numeric: tabular-nums;
  }
  .ch-count.done {
    color: var(--ok);
  }
  .ch-title {
    font-weight: 560;
  }
  .ch-tag {
    margin-inline-start: var(--space-2);
    padding: 0 0.4em;
    border: 1px solid var(--edge-strong);
    border-radius: var(--radius-1);
    color: var(--text-faint);
    font-size: var(--step--1);
    font-weight: 500;
  }
  .ch-bar {
    block-size: 4px;
    border-radius: 2px;
    background: var(--bg-sunken);
    overflow: hidden;
  }
  .ch-bar-fill {
    display: block;
    block-size: 100%;
    background: var(--accent);
  }
  .lessons {
    margin: 0;
    padding: 0 0 var(--space-3) 3.5rem;
    list-style: none;
  }
  .lesson {
    display: flex;
    gap: var(--space-3);
    align-items: baseline;
    justify-content: space-between;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-1);
    color: var(--text-muted);
    text-decoration: none;
  }
  .lesson:hover {
    background: var(--bg-sunken);
    color: var(--text);
  }
  .lesson[data-lock='locked'] {
    color: var(--text-faint);
  }
  .lesson[data-next='true'] {
    color: var(--accent);
    font-weight: 560;
  }
  .lesson-meta {
    flex: none;
    color: var(--text-faint);
    font-size: var(--step--1);
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 30rem) {
    .chapter-head {
      grid-template-columns: 2.5rem 1fr auto;
    }
    .ch-bar {
      display: none;
    }
    .lessons {
      padding-inline-start: var(--space-2);
    }
  }
</style>
