<script lang="ts">
  import { conceptById, type Concept, type Question } from '../../content';
  import type { CourseStore } from '../../lib/app/store.svelte';
  import { lessonHref } from '../../lib/app/router';
  import type { Rating } from '../../lib/domain/state';
  import RichText from '../blocks/RichText.svelte';

  interface Props {
    store: CourseStore;
  }
  const { store }: Props = $props();

  const retention = $derived(store.retention());

  /**
   * The queue is frozen at mount. Grading a card pushes its lesson into the
   * future, so re-reading `dueToday()` would both shrink the queue and make
   * the "session complete" branch fire early; an undo has to bring a card
   * back, which a derived list cannot do.
   */
  const queue = $state<{ conceptId: string; overdueDays: number }[]>([]);
  const graded = $state<string[]>([]);
  const startedAt = Date.now();

  const remaining = $derived(queue.filter((card) => !graded.includes(card.conceptId)));
  const current = $derived(
    remaining[0] === undefined ? null : (conceptById.get(remaining[0].conceptId) ?? null),
  );
  const overdueDays = $derived(remaining[0]?.overdueDays ?? 0);
  const finished = $derived(queue.length > 0 && graded.length === queue.length);
  const minutesSpent = $derived(Math.max(1, Math.round((Date.now() - startedAt) / 60000)));

  $effect(() => {
    // Populated once, on mount. Reading dueToday() here rather than in a
    // $derived is deliberate; see the comment on `queue`.
    if (queue.length === 0 && graded.length === 0) queue.push(...store.dueToday());
  });

  const RATE: { rating: Rating; label: string; hint: string }[] = [
    { rating: 'again', label: 'Again', hint: 'Show it tomorrow' },
    { rating: 'hard', label: 'Hard', hint: 'Shorten the interval' },
    { rating: 'good', label: 'Good', hint: 'Next rung of the ladder' },
    { rating: 'easy', label: 'Easy', hint: 'Skip ahead' },
  ];

  function rate(id: string, rating: Rating): void {
    store.rate(id, rating);
    graded.push(id);
  }

  /** A question the learner has answered before, rotating on the streak. */
  function recallCard(concept: Concept): Question | undefined {
    const answers = store.answersFor(concept);
    const answered = concept.questions.filter(
      (q) => answers[q.id]?.selfPassed !== undefined || answers[q.id]?.selected !== undefined,
    );
    const pool = answered.length > 0 ? answered : concept.questions;
    const streak = store.lessonOf(concept.id).review?.streak ?? 0;
    return pool[streak % pool.length];
  }
</script>

<svelte:head><title>Review · Rust Mastery</title></svelte:head>

<h1>Recall</h1>
<p class="intro">
  {#if queue.length === 0}
    Nothing is due. Lessons you pass join the schedule the next day.
  {:else}
    {queue.length}
    {queue.length === 1 ? 'lesson is' : 'lessons are'} scheduled. Answer from memory first, then check.
  {/if}
</p>

{#if retention.matured + retention.learning > 0}
  <p class="retention">
    {retention.matured} mature · {retention.learning} still building · {retention.lapses}
    {retention.lapses === 1 ? 'lapse' : 'lapses'} recorded
  </p>
{/if}

{#if store.canUndoRate}
  <p class="undo">
    <button
      type="button"
      class="btn"
      onclick={() => {
        store.undoLastRate();
        graded.pop();
      }}
    >
      Undo last grade
    </button>
  </p>
{/if}

{#if queue.length === 0}
  <p><a href="#/course">Back to the sequence</a></p>
{:else if finished}
  <section class="done" aria-live="polite">
    <h2>Session complete</h2>
    <p>
      {graded.length}
      {graded.length === 1 ? 'card' : 'cards'} graded in {minutesSpent} min.
    </p>
    <p><a href="#/">Back to the dashboard</a></p>
  </section>
{:else if current !== null}
  {@const question = recallCard(current)}
  <p class="position">
    {remaining.length} left
  </p>
  <article class="card">
    <p class="card-meta">
      <a href={lessonHref(current.id)}>{current.title}</a>
      {#if overdueDays > 0}
        <span class="late">
          {overdueDays}
          {overdueDays === 1 ? 'day' : 'days'} late
        </span>
      {:else}
        <span class="due">due today</span>
      {/if}
    </p>
    {#if question !== undefined}
      <div class="card-body">
        <RichText text={question.prompt} lead />
      </div>
      <details>
        <summary>Show the answer</summary>
        <div class="card-body">
          <RichText text={question.explain} />
        </div>
      </details>
    {/if}
    <div class="grades" role="group" aria-label="How well did you recall it?">
      {#each RATE as option (option.rating)}
        <button
          type="button"
          class="grade"
          data-rating={option.rating}
          onclick={() => {
            rate(current.id, option.rating);
          }}
        >
          <span class="grade-label">{option.label}</span>
          <span class="grade-hint">{option.hint}</span>
        </button>
      {/each}
    </div>
  </article>
{/if}

<style>
  h1 {
    margin-block-end: var(--space-2);
  }
  .intro,
  .retention,
  .position {
    max-inline-size: var(--measure);
    color: var(--text-muted);
  }
  .retention,
  .position {
    font-size: var(--step--1);
  }
  .undo {
    margin-block: var(--space-3);
  }
  .card {
    max-inline-size: 46rem;
    padding: var(--space-4);
    border: 1px solid var(--edge);
    border-radius: var(--radius-3);
    background: var(--bg-raised);
  }
  .card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: baseline;
    margin: 0 0 var(--space-3);
    font-size: var(--step--1);
  }
  .card-meta a {
    font-weight: 580;
  }
  .due {
    color: var(--text-faint);
  }
  .late {
    color: var(--warn);
  }
  .card-body {
    max-inline-size: var(--measure);
  }
  details {
    margin-block: var(--space-2) var(--space-4);
  }
  summary {
    color: var(--accent);
    cursor: pointer;
  }
  .grades {
    display: grid;
    gap: var(--space-2);
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  }
  .grade {
    display: grid;
    gap: 0.1rem;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--edge);
    border-radius: var(--radius-2);
    background: var(--bg);
    text-align: start;
    cursor: pointer;
  }
  .grade:hover {
    border-color: var(--accent);
    background: var(--accent-quiet);
  }
  .grade[data-rating='again'] {
    border-color: var(--bad);
  }
  .grade[data-rating='easy'] {
    border-color: var(--ok);
  }
  .grade-label {
    font-weight: 580;
  }
  .grade-hint {
    color: var(--text-faint);
    font-size: var(--step--1);
  }
  .done {
    max-inline-size: 46rem;
    padding: var(--space-5);
    border: 1px solid var(--ok);
    border-radius: var(--radius-3);
    background: var(--ok-quiet);
  }
  .btn {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--edge-strong);
    border-radius: var(--radius-2);
    background: var(--bg-raised);
    cursor: pointer;
  }
</style>
