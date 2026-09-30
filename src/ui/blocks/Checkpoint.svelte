<script lang="ts">
  import type { CourseStore } from '../../lib/app/store.svelte';
  import type { Concept } from '../../content';
  import QuestionCard from './QuestionCard.svelte';

  interface Props {
    store: CourseStore;
    concept: Concept;
  }
  const { store, concept }: Props = $props();

  const checkpoint = $derived(store.checkpoint(concept));
  const passed = $derived(checkpoint.passed);
  const attempts = $derived(store.lessonOf(concept.id).attempts);
</script>

<section class="checkpoint" aria-labelledby="checkpoint-{concept.id}">
  <header class="cp-head">
    <h3 id="checkpoint-{concept.id}">Checkpoint</h3>
    <p class="cp-meta">
      {checkpoint.total} questions, all must be right
      {#if attempts > 0}
        · {attempts} attempt{attempts === 1 ? '' : 's'}
        {#if passed}
          so far{/if}
      {/if}
    </p>
  </header>

  {#if checkpoint.answered > 0}
    <p class="cp-progress" role="status">
      {checkpoint.answered} of {checkpoint.total} answered · {checkpoint.correct} right
      {#if checkpoint.wrong > 0}· {checkpoint.wrong} to redo{/if}
    </p>
  {/if}

  {#if checkpoint.answered === 0 && attempts === 0}
    <p class="cp-intro">
      Answer every question correctly to complete the lesson. Questions you get wrong can be retried
      without restarting the whole checkpoint.
    </p>
  {/if}

  <ol class="q-list">
    {#each concept.questions as question, i (question.id)}
      <li>
        <QuestionCard
          {concept}
          {question}
          index={i}
          answer={store.answersFor(concept)[question.id]}
          order={store.optionOrderFor(concept, question.id)}
          onchoose={(optionId: string) => {
            store.choose(concept.id, question.id, optionId);
          }}
          onreveal={() => {
            store.reveal(concept.id, question.id);
          }}
          ongrade={(ok: boolean) => {
            store.selfGrade(concept.id, question.id, ok);
          }}
        />
      </li>
    {/each}
  </ol>

  {#if checkpoint.answered > 0}
    <div class="cp-foot">
      {#if checkpoint.wrong > 0}
        <button
          type="button"
          class="btn primary"
          onclick={() => {
            store.retryWrong(concept.id);
          }}
        >
          Retry {checkpoint.wrong}
          {checkpoint.wrong === 1 ? 'question' : 'questions'}
        </button>
      {/if}
      <button
        type="button"
        class="btn"
        onclick={() => {
          store.retake(concept.id);
        }}>Start over</button
      >
      {#if passed}
        <p class="cp-note ok">Passed. You can retake it any time to refresh.</p>
      {:else if checkpoint.complete}
        <p class="cp-note bad">Not passed. Redo the questions marked wrong.</p>
      {/if}
    </div>
  {/if}
</section>

<style>
  .checkpoint {
    padding: var(--space-4);
    border: 1px solid var(--edge);
    border-radius: var(--radius-3);
    background: var(--bg-sunken);
  }
  .cp-head {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: baseline;
    justify-content: space-between;
    margin-block-end: var(--space-3);
  }
  .cp-meta,
  .cp-progress,
  .cp-intro,
  .cp-note {
    margin: 0;
    color: var(--text-muted);
    font-size: var(--step--1);
  }
  .cp-progress {
    margin-block-end: var(--space-3);
    font-variant-numeric: tabular-nums;
  }
  .cp-intro {
    max-inline-size: var(--measure);
    margin-block-end: var(--space-4);
  }
  /* min-inline-size:0 on both the track and the items: a grid item's default
     min-width is min-content, so a long code line widens the whole page. */
  .q-list {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .q-list > li {
    min-inline-size: 0;
  }
  .cp-foot {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: center;
    margin-block-start: var(--space-4);
  }
  .cp-note.ok {
    color: var(--ok);
  }
  .cp-note.bad {
    color: var(--bad);
  }
  .btn {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--edge-strong);
    border-radius: var(--radius-2);
    background: var(--bg-raised);
    cursor: pointer;
  }
  .btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  .btn.primary {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--accent-ink);
  }
  .btn.primary:hover {
    background: var(--accent-hover);
    color: var(--accent-ink);
  }
</style>
