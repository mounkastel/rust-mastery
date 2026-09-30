<script lang="ts">
  import { chapterOf, conceptById, curriculum, firstLesson, type Chapter } from '../../content';
  import type { CourseStore } from '../../lib/app/store.svelte';
  import { lessonHref } from '../../lib/app/router';
  import { formatMinutes } from '../../lib/domain/clock';
  import type { LockState } from '../../lib/domain/curriculum';
  import { MATURE_INTERVAL_DAYS } from '../../lib/domain/srs';

  interface Props {
    store: CourseStore;
  }
  const { store }: Props = $props();

  const LOCK_ORDER: LockState[] = ['available', 'started', 'revisit', 'locked', 'passed'];
  const LOCK_WORD: Record<LockState, string> = {
    locked: 'Locked',
    available: 'Not started',
    started: 'In progress',
    revisit: 'Retake due',
    passed: 'Passed',
  };

  const summary = $derived(store.summarise());
  const due = $derived(store.dueToday());
  const retention = $derived(store.retention());
  const next = $derived(summary.next === null ? null : (conceptById.get(summary.next) ?? null));
  const last = $derived(
    store.progress.lastLessonId === null
      ? null
      : (conceptById.get(store.progress.lastLessonId) ?? null),
  );
  const nextChapter = $derived(next === null ? null : (chapterOf(next.id) ?? null));

  const tally = $derived.by(() => {
    const counts: Record<LockState, number> = {
      locked: 0,
      available: 0,
      started: 0,
      revisit: 0,
      passed: 0,
    };
    for (const view of store.views()) counts[view.lock] += 1;
    return LOCK_ORDER.map((lock) => ({ lock, n: counts[lock] })).filter((row) => row.n > 0);
  });

  const upcoming = $derived(
    curriculum.chapters
      .map((chapter: Chapter) => ({
        chapter,
        done: chapter.concepts.filter((c) => store.lessonOf(c.id).passed).length,
      }))
      .filter((row) => row.done < row.chapter.concepts.length)
      .slice(0, 4),
  );
</script>

<svelte:head><title>Rust Mastery</title></svelte:head>

<h1>Where you are</h1>

<section class="next" aria-labelledby="next-heading">
  <h2 id="next-heading" class="visually-hidden">Next lesson</h2>
  {#if next !== null}
    <p class="eyebrow">Next up</p>
    <h3 class="next-title"><a href={lessonHref(next.id)}>{next.title}</a></h3>
    <p class="next-meta">
      {#if nextChapter !== null}{nextChapter.title} ·{/if}
      {formatMinutes(next.estMinutes)} · {next.questions.length} questions
    </p>
    <a class="cta" href={lessonHref(next.id)}>Open lesson</a>
  {:else if last !== null}
    <p class="eyebrow">Course complete</p>
    <h3 class="next-title"><a href={lessonHref(last.id)}>Revisit {last.title}</a></h3>
    <p class="next-meta">Everything is passed. Retakes keep the material fresh.</p>
  {:else}
    <p class="eyebrow">Start here</p>
    <h3 class="next-title"><a href={lessonHref(firstLesson.id)}>{firstLesson.title}</a></h3>
    <a class="cta" href={lessonHref(firstLesson.id)}>Open lesson</a>
  {/if}
  {#if last !== null && next !== null && last.id !== next.id}
    <p class="resume">You were last in <a href={lessonHref(last.id)}>{last.title}</a>.</p>
  {/if}
</section>

<div class="grid">
  <section class="stat" aria-labelledby="due-h">
    <h2 id="due-h">Reviews due</h2>
    <p class="figure" class:zero={due.length === 0}>{due.length}</p>
    <p class="note">
      {#if due.length === 0}
        Nothing scheduled for today.
      {:else if due.length === 1}
        <a href="#/review">One card to recall</a>
      {:else}
        <a href="#/review">{due.length} cards to recall</a>
      {/if}
    </p>
  </section>

  <section class="stat" aria-labelledby="progress-h">
    <h2 id="progress-h">Lessons passed</h2>
    <p class="figure">{summary.passed}<span class="of">/ {summary.total}</span></p>
    <p class="note">{formatMinutes(summary.minutesLeft)} of reading and drills left</p>
  </section>

  <section class="stat" aria-labelledby="retention-h">
    <h2 id="retention-h">Retention</h2>
    <p class="figure">{Math.round(retention.stableRatio * 100)}<span class="of">%</span></p>
    <p class="note">
      {retention.matured} of {retention.matured + retention.learning} scheduled lessons are at
      {MATURE_INTERVAL_DAYS}+ day intervals
    </p>
  </section>
</div>

<section class="tally" aria-labelledby="tally-h">
  <h2 id="tally-h">By status</h2>
  <ul>
    {#each tally as row (row.lock)}
      <li>
        <span class="swatch" data-lock={row.lock} aria-hidden="true"></span>
        <span>{LOCK_WORD[row.lock]}</span>
        <span class="count">{row.n}</span>
      </li>
    {/each}
  </ul>
</section>

{#if upcoming.length > 0}
  <section class="chapters" aria-labelledby="upcoming-h">
    <h2 id="upcoming-h">Still ahead</h2>
    <ol>
      {#each upcoming as row (row.chapter.key)}
        <li>
          <span class="ch-num">{row.chapter.num ?? 'Bonus'}</span>
          <span class="ch-title">{row.chapter.title}</span>
          <span class="ch-count">{row.done}/{row.chapter.concepts.length}</span>
        </li>
      {/each}
    </ol>
    <p><a href="#/course">See the whole sequence</a></p>
  </section>
{/if}

<style>
  h1 {
    margin-block-end: var(--space-5);
  }
  .eyebrow {
    margin: 0;
    color: var(--accent);
    font-size: var(--step--1);
    font-weight: 640;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .next {
    padding: var(--space-5);
    border: 1px solid var(--edge);
    border-inline-start: 3px solid var(--accent);
    border-radius: var(--radius-3);
    background: var(--bg-raised);
  }
  .next-title {
    margin: var(--space-1) 0 var(--space-2);
    font-size: var(--step-4);
  }
  .next-title a {
    color: var(--text);
    text-decoration-color: var(--edge-strong);
  }
  .next-meta,
  .note,
  .resume {
    margin: 0 0 var(--space-3);
    color: var(--text-muted);
    font-size: var(--step--1);
  }
  .resume {
    margin-block-start: var(--space-3);
    margin-block-end: 0;
  }
  .cta {
    display: inline-block;
    padding: var(--space-2) var(--space-5);
    border-radius: var(--radius-2);
    background: var(--accent);
    color: var(--accent-ink);
    font-weight: 580;
    text-decoration: none;
  }
  .cta:hover {
    background: var(--accent-hover);
    color: var(--accent-ink);
  }
  .grid {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    margin-block: var(--space-5);
  }
  .stat {
    padding: var(--space-4);
    border: 1px solid var(--edge);
    border-radius: var(--radius-3);
    background: var(--bg-raised);
  }
  .stat h2 {
    color: var(--text-muted);
    font-size: var(--step--1);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .figure {
    margin: var(--space-2) 0;
    font-size: var(--step-5);
    font-weight: 620;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }
  .figure.zero {
    color: var(--text-faint);
  }
  .of {
    color: var(--text-faint);
    font-size: var(--step-2);
    font-weight: 500;
  }
  .note {
    margin: 0;
  }
  .tally ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .tally li {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    color: var(--text-muted);
    font-size: var(--step--1);
  }
  .count {
    color: var(--text);
    font-weight: 620;
    font-variant-numeric: tabular-nums;
  }
  .swatch {
    inline-size: 0.6rem;
    block-size: 0.6rem;
    border: 1.5px solid var(--edge-strong);
    border-radius: 50%;
  }
  .swatch[data-lock='started'] {
    border-color: var(--warn);
    background: var(--warn);
  }
  .swatch[data-lock='passed'] {
    border-color: var(--ok);
    background: var(--ok);
  }
  .swatch[data-lock='revisit'] {
    border-color: var(--bad);
    background: var(--bad);
  }
  .chapters {
    margin-block-start: var(--space-6);
  }
  .chapters ol {
    margin: 0 0 var(--space-3);
    padding: 0;
    list-style: none;
  }
  .chapters li {
    display: grid;
    grid-template-columns: 3.5rem 1fr auto;
    gap: var(--space-3);
    padding-block: var(--space-2);
    border-block-end: 1px solid var(--edge);
  }
  .ch-num,
  .ch-count {
    color: var(--text-faint);
    font-family: var(--mono);
    font-size: var(--step--1);
    font-variant-numeric: tabular-nums;
  }
</style>
